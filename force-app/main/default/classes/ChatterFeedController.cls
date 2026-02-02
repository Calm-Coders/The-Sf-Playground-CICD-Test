/**
 * @description Controller for custom Chatter Feed LWC component
 * Handles fetching and managing FeedItems filtered by Type='TextPost'
 */
public with sharing class ChatterFeedController {

    /**
     * @description Fetch FeedItems for a specific parent record, filtered by Type='TextPost'
     * @param recordId The parent record ID
     * @param pageSize Number of items to fetch
     * @param pageToken Token for pagination
     * @return Map containing feed items and pagination info
     */
    @AuraEnabled(cacheable=true)
    public static String getFeedItems(String recordId, Integer pageSize, String pageToken) {
        try {
            // Use ConnectApi to fetch feed items
            ConnectApi.FeedElementPage feedPage;

            if (String.isBlank(pageToken)) {
                feedPage = ConnectApi.ChatterFeeds.getFeedElementsFromFeed(
                    null,
                    ConnectApi.FeedType.Record,
                    recordId,
                    pageSize,
                    ConnectApi.FeedDensity.AllUpdates,
                    null,
                    pageSize,
                    ConnectApi.FeedSortOrder.CreatedDateDesc
                );
            } else {
                feedPage = ConnectApi.ChatterFeeds.getFeedElementsFromFeed(
                    null,
                    ConnectApi.FeedType.Record,
                    recordId,
                    pageSize,
                    ConnectApi.FeedDensity.AllUpdates,
                    null,
                    pageSize,
                    ConnectApi.FeedSortOrder.CreatedDateDesc,
                    pageToken
                );
            }

            // Filter for TextPost type only
            List<ConnectApi.FeedElement> filteredElements = new List<ConnectApi.FeedElement>();
            for (ConnectApi.FeedElement element : feedPage.elements) {
                if (element.feedElementType == ConnectApi.FeedElementType.FeedItem) {
                    ConnectApi.FeedItem feedItem = (ConnectApi.FeedItem) element;
                    if (feedItem.type == ConnectApi.FeedItemType.TextPost) {
                        filteredElements.add(element);
                    }
                }
            }

            // Create a new page with filtered elements
            Map<String, Object> result = new Map<String, Object>();
            result.put('elements', filteredElements);
            result.put('nextPageToken', feedPage.nextPageUrl);
            result.put('currentPageToken', feedPage.currentPageToken);

            return JSON.serialize(result);

        } catch (Exception e) {
            throw new AuraHandledException('Error fetching feed items: ' + e.getMessage());
        }
    }

    /**
     * @description Post a new text post to the feed
     * @param recordId The parent record ID
     * @param messageText The text content of the post
     * @return The created feed element
     */
    @AuraEnabled
    public static String postFeedItem(String recordId, String messageText) {
        try {
            ConnectApi.FeedItemInput feedItemInput = new ConnectApi.FeedItemInput();
            ConnectApi.MessageBodyInput messageBodyInput = new ConnectApi.MessageBodyInput();
            messageBodyInput.messageSegments = new List<ConnectApi.MessageSegmentInput>();

            // Parse mentions and text
            List<ConnectApi.MessageSegmentInput> segments = parseMentions(messageText);
            messageBodyInput.messageSegments = segments;

            feedItemInput.body = messageBodyInput;
            feedItemInput.feedElementType = ConnectApi.FeedElementType.FeedItem;
            feedItemInput.subjectId = recordId;

            ConnectApi.FeedElement feedElement = ConnectApi.ChatterFeeds.postFeedElement(
                null,
                feedItemInput
            );

            Map<String, Object> result = new Map<String, Object>{
                'success' => true,
                'feedElement' => feedElement
            };

            return JSON.serialize(result);

        } catch (Exception e) {
            throw new AuraHandledException('Error posting feed item: ' + e.getMessage());
        }
    }

    /**
     * @description Add a comment to a feed item
     * @param feedElementId The feed element ID
     * @param commentText The comment text
     * @return The created comment
     */
    @AuraEnabled
    public static String postComment(String feedElementId, String commentText) {
        try {
            ConnectApi.CommentInput commentInput = new ConnectApi.CommentInput();
            ConnectApi.MessageBodyInput messageBodyInput = new ConnectApi.MessageBodyInput();

            // Parse mentions and text
            List<ConnectApi.MessageSegmentInput> segments = parseMentions(commentText);
            messageBodyInput.messageSegments = segments;

            commentInput.body = messageBodyInput;

            ConnectApi.Comment comment = ConnectApi.ChatterFeeds.postCommentToFeedElement(
                null,
                feedElementId,
                commentInput,
                null
            );

            Map<String, Object> result = new Map<String, Object>{
                'success' => true,
                'comment' => comment
            };

            return JSON.serialize(result);

        } catch (Exception e) {
            throw new AuraHandledException('Error posting comment: ' + e.getMessage());
        }
    }

    /**
     * @description Like a feed item
     * @param feedElementId The feed element ID
     * @return Success status
     */
    @AuraEnabled
    public static String likeFeedItem(String feedElementId) {
        try {
            ConnectApi.ChatterLike chatterLike = ConnectApi.ChatterFeeds.likeFeedElement(
                null,
                feedElementId
            );

            Map<String, Object> result = new Map<String, Object>{
                'success' => true,
                'chatterLike' => chatterLike
            };

            return JSON.serialize(result);

        } catch (Exception e) {
            throw new AuraHandledException('Error liking feed item: ' + e.getMessage());
        }
    }

    /**
     * @description Unlike a feed item
     * @param feedElementId The feed element ID
     * @return Success status
     */
    @AuraEnabled
    public static String unlikeFeedItem(String feedElementId) {
        try {
            // Get current user's like ID first
            ConnectApi.FeedElement feedElement = ConnectApi.ChatterFeeds.getFeedElement(null, feedElementId);
            if (feedElement.feedElementType == ConnectApi.FeedElementType.FeedItem) {
                ConnectApi.FeedItem feedItem = (ConnectApi.FeedItem) feedElement;
                if (feedItem.capabilities != null &&
                    feedItem.capabilities.chatterLikes != null &&
                    feedItem.capabilities.chatterLikes.myLike != null) {
                    String likeId = feedItem.capabilities.chatterLikes.myLike.id;
                    ConnectApi.ChatterFeeds.deleteLike(null, likeId);
                }
            }

            Map<String, Object> result = new Map<String, Object>{
                'success' => true
            };

            return JSON.serialize(result);

        } catch (Exception e) {
            throw new AuraHandledException('Error unliking feed item: ' + e.getMessage());
        }
    }

    /**
     * @description Get comments for a feed element
     * @param feedElementId The feed element ID
     * @param pageSize Number of comments to fetch
     * @return Comments data
     */
    @AuraEnabled(cacheable=true)
    public static String getComments(String feedElementId, Integer pageSize) {
        try {
            ConnectApi.CommentPage commentPage = ConnectApi.ChatterFeeds.getCommentsForFeedElement(
                null,
                feedElementId
            );

            Map<String, Object> result = new Map<String, Object>{
                'comments' => commentPage,
                'nextPageToken' => commentPage.nextPageUrl,
                'total' => commentPage.total
            };

            return JSON.serialize(result);

        } catch (Exception e) {
            throw new AuraHandledException('Error fetching comments: ' + e.getMessage());
        }
    }

    /**
     * @description Search for users to mention
     * @param searchKey The search term
     * @return List of users
     */
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> searchUsers(String searchKey) {
        try {
            List<Map<String, String>> userList = new List<Map<String, String>>();

            String searchPattern = '%' + String.escapeSingleQuotes(searchKey) + '%';
            List<User> users = [
                SELECT Id, Name, SmallPhotoUrl
                FROM User
                WHERE IsActive = true AND Name LIKE :searchPattern
                LIMIT 10
            ];

            for (User u : users) {
                userList.add(new Map<String, String>{
                    'id' => u.Id,
                    'name' => u.Name,
                    'photoUrl' => u.SmallPhotoUrl
                });
            }

            return userList;

        } catch (Exception e) {
            throw new AuraHandledException('Error searching users: ' + e.getMessage());
        }
    }


    /**
     * @description Delete a feed element
     * @param feedElementId The feed element ID
     * @return Success status
     */
    @AuraEnabled
    public static String deleteFeedElement(String feedElementId) {
        try {
            ConnectApi.ChatterFeeds.deleteFeedElement(null, feedElementId);

            Map<String, Object> result = new Map<String, Object>{
                'success' => true
            };

            return JSON.serialize(result);

        } catch (Exception e) {
            throw new AuraHandledException('Error deleting feed element: ' + e.getMessage());
        }
    }

    /**
     * @description Update a feed element
     * @param feedElementId The feed element ID
     * @param newText The new text for the post
     * @return The updated feed element
     */
    @AuraEnabled
    public static String updateFeedElement(String feedElementId, String newText) {
        try {
            ConnectApi.FeedItemInput feedItemInput = new ConnectApi.FeedItemInput();
            ConnectApi.MessageBodyInput messageBodyInput = new ConnectApi.MessageBodyInput();

            // Parse mentions and text
            List<ConnectApi.MessageSegmentInput> segments = parseMentions(newText);
            messageBodyInput.messageSegments = segments;

            feedItemInput.body = messageBodyInput;

            ConnectApi.FeedElement updatedElement = ConnectApi.ChatterFeeds.updateFeedElement(
                null,
                feedElementId,
                feedItemInput
            );

            Map<String, Object> result = new Map<String, Object>{
                'success' => true,
                'feedElement' => updatedElement
            };

            return JSON.serialize(result);

        } catch (Exception e) {
            throw new AuraHandledException('Error updating feed element: ' + e.getMessage());
        }
    }

    /**
     * @description Delete a comment
     * @param commentId The comment ID
     * @return Success status
     */
    @AuraEnabled
    public static String deleteComment(String commentId) {
        try {
            ConnectApi.ChatterFeeds.deleteComment(null, commentId);

            Map<String, Object> result = new Map<String, Object>{
                'success' => true
            };

            return JSON.serialize(result);

        } catch (Exception e) {
            throw new AuraHandledException('Error deleting comment: ' + e.getMessage());
        }
    }

    /**
     * @description Update a comment
     * @param commentId The comment ID
     * @param newText The new comment text
     * @return The updated comment
     */
    @AuraEnabled
    public static String updateComment(String commentId, String newText) {
        try {
            ConnectApi.CommentInput commentInput = new ConnectApi.CommentInput();
            ConnectApi.MessageBodyInput messageBodyInput = new ConnectApi.MessageBodyInput();

            // Parse mentions and text
            List<ConnectApi.MessageSegmentInput> segments = parseMentions(newText);
            messageBodyInput.messageSegments = segments;

            commentInput.body = messageBodyInput;

            ConnectApi.Comment updatedComment = ConnectApi.ChatterFeeds.updateComment(
                null,
                commentId,
                commentInput
            );

            Map<String, Object> result = new Map<String, Object>{
                'success' => true,
                'comment' => updatedComment
            };

            return JSON.serialize(result);

        } catch (Exception e) {
            throw new AuraHandledException('Error updating comment: ' + e.getMessage());
        }
    }


    /**
     * @description Parse text with @mentions
     * @param text The text to parse
     * @return List of message segments
     */
    private static List<ConnectApi.MessageSegmentInput> parseMentions(String text) {
        List<ConnectApi.MessageSegmentInput> segments = new List<ConnectApi.MessageSegmentInput>();

        // Pattern to match @[userId:userName]
        Pattern mentionPattern = Pattern.compile('@\\[(\\w{15}|\\w{18}):([^\\]]+)\\]');
        Matcher matcher = mentionPattern.matcher(text);

        Integer lastEnd = 0;

        while (matcher.find()) {
            // Add text before mention
            if (matcher.start() > lastEnd) {
                String textBefore = text.substring(lastEnd, matcher.start());
                if (String.isNotBlank(textBefore)) {
                    ConnectApi.TextSegmentInput textSegment = new ConnectApi.TextSegmentInput();
                    textSegment.text = textBefore;
                    segments.add(textSegment);
                }
            }

            // Add mention
            String userId = matcher.group(1);
            ConnectApi.MentionSegmentInput mentionSegment = new ConnectApi.MentionSegmentInput();
            mentionSegment.id = userId;
            segments.add(mentionSegment);

            lastEnd = matcher.end();
        }

        // Add remaining text
        if (lastEnd < text.length()) {
            String remainingText = text.substring(lastEnd);
            if (String.isNotBlank(remainingText)) {
                ConnectApi.TextSegmentInput textSegment = new ConnectApi.TextSegmentInput();
                textSegment.text = remainingText;
                segments.add(textSegment);
            }
        }

        // If no mentions found, add entire text
        if (segments.isEmpty() && String.isNotBlank(text)) {
            ConnectApi.TextSegmentInput textSegment = new ConnectApi.TextSegmentInput();
            textSegment.text = text;
            segments.add(textSegment);
        }

        return segments;
    }
}