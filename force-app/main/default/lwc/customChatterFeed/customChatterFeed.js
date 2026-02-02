import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getFeedItems from '@salesforce/apex/ChatterFeedController.getFeedItems';
import postFeedItem from '@salesforce/apex/ChatterFeedController.postFeedItem';
import postComment from '@salesforce/apex/ChatterFeedController.postComment';
import likeFeedItem from '@salesforce/apex/ChatterFeedController.likeFeedItem';
import unlikeFeedItem from '@salesforce/apex/ChatterFeedController.unlikeFeedItem';
import getComments from '@salesforce/apex/ChatterFeedController.getComments';
import searchUsers from '@salesforce/apex/ChatterFeedController.searchUsers';
import deleteFeedElement from '@salesforce/apex/ChatterFeedController.deleteFeedElement';
import updateFeedElement from '@salesforce/apex/ChatterFeedController.updateFeedElement';
import deleteComment from '@salesforce/apex/ChatterFeedController.deleteComment';
import updateComment from '@salesforce/apex/ChatterFeedController.updateComment';
import userId from '@salesforce/user/Id';

export default class CustomChatterFeed extends LightningElement {
    @api recordId;
    @track feedItems = [];
    @track newPostText = '';
    @track isLoading = false;
    @track error;
    @track showUserSuggestions = false;
    @track userSuggestions = [];
    @track mentionStartIndex = -1;
    @track mentionSearchTerm = '';

    currentUserId = userId;
    pageSize = 10;
    nextPageToken = null;
    wiredFeedResult;

    @track commentTexts = {};
    @track sortByValue = 'CreatedDateDesc';
    @track searchTerm = '';

    sortByOptions = [
        { label: 'Latest Posts', value: 'CreatedDateDesc' },
        { label: 'Oldest Posts', value: 'CreatedDateAsc' }
    ];

    connectedCallback() {
        this.loadFeedItems();
    }

    handleSortChange(event) {
        this.sortByValue = event.detail.value;
        this.loadFeedItems();
    }

    handleSearchChange(event) {
        this.searchTerm = event.detail.value;
        // Implement search filtering if needed
    }

    loadFeedItems() {
        this.isLoading = true;
        this.error = undefined;

        getFeedItems({
            recordId: this.recordId,
            pageSize: this.pageSize,
            pageToken: null
        })
        .then(jsonString => {
            const result = JSON.parse(jsonString);
            this.feedItems = result.elements || [];
            this.nextPageToken = result.nextPageToken;
            this.isLoading = false;
        })
        .catch(error => {
            this.error = error;
            this.isLoading = false;
            this.showToast('Error', this.getErrorMessage(error), 'error');
        });
    }

    handleNewPostChange(event) {
        this.newPostText = event.target.value;
        this.checkForMention(event.target);
    }

    handleNewPostKeyUp(event) {
        this.checkForMention(event.target);
    }

    async checkForMention(inputElement) {
        const text = inputElement.value;
        const cursorPosition = inputElement.selectionStart;

        // Find the last @ before cursor
        const textBeforeCursor = text.substring(0, cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);

            // Check if there's a space after @ (which would end the mention)
            if (!textAfterAt.includes(' ') && textAfterAt.length > 0) {
                this.mentionStartIndex = lastAtIndex;
                this.mentionSearchTerm = textAfterAt;
                await this.searchUsersForMention(textAfterAt);
                this.showUserSuggestions = true;
            } else if (textAfterAt.length === 0) {
                this.mentionStartIndex = lastAtIndex;
                this.mentionSearchTerm = '';
                this.showUserSuggestions = false;
            } else {
                this.showUserSuggestions = false;
            }
        } else {
            this.showUserSuggestions = false;
        }
    }

    async searchUsersForMention(searchTerm) {
        if (searchTerm.length < 1) {
            this.userSuggestions = [];
            return;
        }

        try {
            const users = await searchUsers({ searchKey: searchTerm });
            this.userSuggestions = users || [];
        } catch (error) {
            console.error('Error searching users:', error);
            this.userSuggestions = [];
        }
    }

    handleUserSelect(event) {
        const userId = event.currentTarget.dataset.userId;
        const userName = event.currentTarget.dataset.userName;

        // Replace the @mention with the formatted mention
        const beforeMention = this.newPostText.substring(0, this.mentionStartIndex);
        const afterMention = this.newPostText.substring(this.mentionStartIndex + this.mentionSearchTerm.length + 1);

        this.newPostText = beforeMention + `@[${userId}:${userName}]` + afterMention;

        this.showUserSuggestions = false;
        this.mentionStartIndex = -1;
        this.mentionSearchTerm = '';
        this.userSuggestions = [];
    }

    async handlePostSubmit() {
        if (!this.newPostText.trim()) {
            this.showToast('Error', 'Please enter some text', 'error');
            return;
        }

        this.isLoading = true;

        try {
            const jsonString = await postFeedItem({
                recordId: this.recordId,
                messageText: this.newPostText
            });
            const result = JSON.parse(jsonString);

            this.newPostText = '';
            this.showToast('Success', 'Post published successfully', 'success');

            // Reload feed items
            this.loadFeedItems();
        } catch (error) {
            this.showToast('Error', this.getErrorMessage(error), 'error');
        } finally {
            this.isLoading = false;
        }
    }

    handleCommentChange(event) {
        const feedItemId = event.target.dataset.feedItemId;
        this.commentTexts[feedItemId] = event.target.value;
    }

    async handleCommentSubmit(event) {
        const feedItemId = event.currentTarget.dataset.feedItemId;
        const commentText = this.commentTexts[feedItemId];

        if (!commentText || !commentText.trim()) {
            this.showToast('Error', 'Please enter a comment', 'error');
            return;
        }

        // Disable only this specific comment button
        event.currentTarget.disabled = true;

        try {
            const jsonString = await postComment({
                feedElementId: feedItemId,
                commentText: commentText
            });
            const result = JSON.parse(jsonString);
            const newComment = result.comment;

            // Clear the comment text for this specific post
            this.commentTexts = {
                ...this.commentTexts,
                [feedItemId]: ''
            };

            // Add the new comment to the feed items in real-time
            this.feedItems = this.feedItems.map(item => {
                if (item.id === feedItemId) {
                    // Get existing comments
                    const existingComments = item.capabilities?.comments?.page?.items || [];

                    // Add the new comment
                    const updatedComments = [...existingComments, newComment];

                    // Update the item with new comment
                    return {
                        ...item,
                        capabilities: {
                            ...item.capabilities,
                            comments: {
                                ...item.capabilities.comments,
                                page: {
                                    ...item.capabilities.comments.page,
                                    items: updatedComments,
                                    total: (item.capabilities?.comments?.page?.total || 0) + 1
                                }
                            }
                        }
                    };
                }
                return item;
            });

            this.showToast('Success', 'Comment posted successfully', 'success');
        } catch (error) {
            this.showToast('Error', this.getErrorMessage(error), 'error');
        } finally {
            // Re-enable the button
            event.currentTarget.disabled = false;
        }
    }

    async handleLike(event) {
        event.preventDefault();
        const feedItemId = event.currentTarget.dataset.feedItemId;
        const isLiked = event.currentTarget.dataset.isLiked === 'true';

        // Optimistic update - update UI immediately without loading spinner
        this.feedItems = this.feedItems.map(item => {
            if (item.id === feedItemId) {
                const currentLikeCount = item.capabilities?.chatterLikes?.page?.total || 0;
                return {
                    ...item,
                    capabilities: {
                        ...item.capabilities,
                        chatterLikes: {
                            ...item.capabilities?.chatterLikes,
                            isLikedByCurrentUser: !isLiked,
                            page: {
                                ...item.capabilities?.chatterLikes?.page,
                                total: isLiked ? currentLikeCount - 1 : currentLikeCount + 1
                            }
                        }
                    }
                };
            }
            return item;
        });

        // Make API call in background (no await, no loading)
        try {
            if (isLiked) {
                unlikeFeedItem({ feedElementId: feedItemId });
            } else {
                likeFeedItem({ feedElementId: feedItemId });
            }
        } catch (error) {
            // Revert on error
            this.feedItems = this.feedItems.map(item => {
                if (item.id === feedItemId) {
                    const currentLikeCount = item.capabilities?.chatterLikes?.page?.total || 0;
                    return {
                        ...item,
                        capabilities: {
                            ...item.capabilities,
                            chatterLikes: {
                                ...item.capabilities?.chatterLikes,
                                isLikedByCurrentUser: isLiked,
                                page: {
                                    ...item.capabilities?.chatterLikes?.page,
                                    total: isLiked ? currentLikeCount + 1 : currentLikeCount - 1
                                }
                            }
                        }
                    };
                }
                return item;
            });
            this.showToast('Error', this.getErrorMessage(error), 'error');
        }
    }

    handleRefresh() {
        this.loadFeedItems();
    }

    get hasError() {
        return !!this.error;
    }

    get hasFeedItems() {
        return this.feedItems && this.feedItems.length > 0;
    }

    get processedFeedItems() {
        return this.feedItems.map(item => {
            const commentCount = item.capabilities?.comments?.page?.total || 0;
            const likeCount = item.capabilities?.chatterLikes?.page?.total || 0;
            const isBookmarked = item.capabilities?.bookmarks?.isBookmarkedByCurrentUser || false;
            const isMuted = item.capabilities?.mute?.isMutedByMe || false;
            const canEdit = item.capabilities?.edit?.isEditableByMe || false;
            const canDelete = item.capabilities?.delete?.isDeletableByMe || false;

            return {
                ...item,
                id: item.id,
                isLiked: item.capabilities?.chatterLikes?.isLikedByCurrentUser || false,
                likeCount: likeCount,
                commentCount: commentCount,
                hasLikes: likeCount > 0,
                hasComments: commentCount > 0,
                hasInteractions: (commentCount > 0 || likeCount > 0),
                isSingleComment: commentCount === 1,
                isSingleView: likeCount === 1,
                commentText: this.commentTexts[item.id] || '',
                formattedDate: this.formatDate(item.createdDate),
                actorName: item.actor?.name || '',
                actorUrl: '/' + (item.actor?.id || ''),
                actorPhotoUrl: item.actor?.photo?.smallPhotoUrl || '/img/profile/avatar.png',
                parentName: item.parent?.name || null,
                parentUrl: item.parent?.id ? '/' + item.parent.id : null,
                bodyText: this.extractTextFromBody(item.body),
                isBookmarked: isBookmarked,
                isMuted: isMuted,
                canEdit: canEdit,
                canDelete: canDelete,
                isCurrentUserPost: item.actor?.id === this.currentUserId,
                isEditing: item.isEditing || false,
                editText: item.editText || '',
                processedComments: this.processComments(item.capabilities?.comments?.page?.items || [])
            };
        });
    }

    processComments(comments) {
        return comments.map(comment => {
            const canEdit = comment.capabilities?.edit?.isEditableByMe || false;
            const canDelete = comment.capabilities?.delete?.isDeletableByMe || false;

            return {
                ...comment,
                id: comment.id,
                formattedDate: this.formatDate(comment.createdDate),
                userName: comment.user?.name || '',
                userUrl: '/' + (comment.user?.id || ''),
                userPhotoUrl: comment.user?.photo?.smallPhotoUrl || '/img/profile/avatar.png',
                bodyText: this.extractTextFromBody(comment.body),
                isLiked: comment.capabilities?.chatterLikes?.isLikedByCurrentUser || false,
                likeCount: comment.capabilities?.chatterLikes?.page?.total || 0,
                canEdit: canEdit,
                canDelete: canDelete,
                isCurrentUserComment: comment.user?.id === this.currentUserId,
                isEditing: comment.isEditing || false,
                editText: comment.editText || ''
            };
        });
    }

    extractTextFromBody(body) {
        if (!body) return '';
        if (!body.messageSegments || body.messageSegments.length === 0) {
            return body.text || '';
        }

        let text = '';
        body.messageSegments.forEach(segment => {
            if (segment.type === 'Text') {
                text += segment.text;
            } else if (segment.type === 'Mention') {
                text += '@' + (segment.name || segment.text);
            }
        });

        return text;
    }

    formatMessageBody(body) {
        if (!body || !body.messageSegments) {
            return body?.text || '';
        }

        let html = '';
        body.messageSegments.forEach(segment => {
            if (segment.type === 'Text') {
                html += this.escapeHtml(segment.text);
            } else if (segment.type === 'Mention') {
                html += `<a href="/${segment.id}" class="mention-link">@${segment.name}</a>`;
            }
        });

        return html;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    getErrorMessage(error) {
        if (error.body && error.body.message) {
            return error.body.message;
        } else if (error.message) {
            return error.message;
        } else if (typeof error === 'string') {
            return error;
        }
        return 'An unknown error occurred';
    }

    get postButtonDisabled() {
        return this.isLoading || !this.newPostText.trim();
    }

    // ========== NEW METHODS FOR FULL CHATTER SYNC ==========

    /**
     * Handle three-dot menu actions
     */
    handleMenuSelect(event) {
        const action = event.detail.value;
        const feedItemId = event.currentTarget.dataset.feedItemId;

        switch(action) {
            case 'edit':
                this.handleEditPost(feedItemId);
                break;
            case 'delete':
                this.handleDeletePost(feedItemId);
                break;
            default:
                break;
        }
    }


    /**
     * Delete a post
     */
    async handleDeletePost(feedItemId) {
        if (!confirm('Are you sure you want to delete this post?')) {
            return;
        }

        this.isLoading = true;

        try {
            const jsonString = await deleteFeedElement({ feedElementId: feedItemId });
            this.showToast('Success', 'Post deleted successfully', 'success');
            this.loadFeedItems();
        } catch (error) {
            this.showToast('Error', this.getErrorMessage(error), 'error');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Edit a post
     */
    handleEditPost(feedItemId) {
        const feedItem = this.feedItems.find(item => item.id === feedItemId);
        if (!feedItem) return;

        // Set editing mode for this post
        this.feedItems = this.feedItems.map(item => {
            if (item.id === feedItemId) {
                return {
                    ...item,
                    isEditing: true,
                    editText: this.extractTextFromBody(item.body)
                };
            }
            return item;
        });
    }

    /**
     * Cancel editing a post
     */
    handleCancelEdit(event) {
        const feedItemId = event.currentTarget.dataset.feedItemId;
        this.feedItems = this.feedItems.map(item => {
            if (item.id === feedItemId) {
                return {
                    ...item,
                    isEditing: false,
                    editText: ''
                };
            }
            return item;
        });
    }

    /**
     * Handle edit text change
     */
    handleEditTextChange(event) {
        const feedItemId = event.target.dataset.feedItemId;
        const newText = event.target.value;

        this.feedItems = this.feedItems.map(item => {
            if (item.id === feedItemId) {
                return {
                    ...item,
                    editText: newText
                };
            }
            return item;
        });
    }

    /**
     * Save edited post
     */
    async handleSaveEdit(event) {
        const feedItemId = event.currentTarget.dataset.feedItemId;
        const feedItem = this.feedItems.find(item => item.id === feedItemId);

        if (!feedItem || !feedItem.editText.trim()) {
            this.showToast('Error', 'Please enter some text', 'error');
            return;
        }

        this.isLoading = true;

        try {
            const jsonString = await updateFeedElement({
                feedElementId: feedItemId,
                newText: feedItem.editText
            });

            this.showToast('Success', 'Post updated successfully', 'success');
            this.loadFeedItems();
        } catch (error) {
            this.showToast('Error', this.getErrorMessage(error), 'error');
        } finally {
            this.isLoading = false;
        }
    }


    /**
     * Handle comment delete
     */
    async handleDeleteComment(event) {
        const commentId = event.currentTarget.dataset.commentId;

        if (!confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        this.isLoading = true;

        try {
            const jsonString = await deleteComment({ commentId: commentId });
            this.showToast('Success', 'Comment deleted successfully', 'success');
            this.loadFeedItems();
        } catch (error) {
            this.showToast('Error', this.getErrorMessage(error), 'error');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Handle comment edit
     */
    handleEditComment(event) {
        const commentId = event.currentTarget.dataset.commentId;
        const feedItemId = event.currentTarget.dataset.feedItemId;

        this.feedItems = this.feedItems.map(item => {
            if (item.id === feedItemId) {
                const updatedComments = item.processedComments.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            isEditing: true,
                            editText: comment.bodyText
                        };
                    }
                    return comment;
                });

                return {
                    ...item,
                    processedComments: updatedComments
                };
            }
            return item;
        });
    }

    /**
     * Cancel editing comment
     */
    handleCancelCommentEdit(event) {
        const commentId = event.currentTarget.dataset.commentId;
        const feedItemId = event.currentTarget.dataset.feedItemId;

        this.feedItems = this.feedItems.map(item => {
            if (item.id === feedItemId) {
                const updatedComments = item.processedComments.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            isEditing: false,
                            editText: ''
                        };
                    }
                    return comment;
                });

                return {
                    ...item,
                    processedComments: updatedComments
                };
            }
            return item;
        });
    }

    /**
     * Handle comment edit text change
     */
    handleCommentEditTextChange(event) {
        const commentId = event.target.dataset.commentId;
        const feedItemId = event.target.dataset.feedItemId;
        const newText = event.target.value;

        this.feedItems = this.feedItems.map(item => {
            if (item.id === feedItemId) {
                const updatedComments = item.processedComments.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            editText: newText
                        };
                    }
                    return comment;
                });

                return {
                    ...item,
                    processedComments: updatedComments
                };
            }
            return item;
        });
    }

    /**
     * Save edited comment
     */
    async handleSaveCommentEdit(event) {
        const commentId = event.currentTarget.dataset.commentId;
        const feedItemId = event.currentTarget.dataset.feedItemId;

        const feedItem = this.feedItems.find(item => item.id === feedItemId);
        const comment = feedItem?.processedComments.find(c => c.id === commentId);

        if (!comment || !comment.editText.trim()) {
            this.showToast('Error', 'Please enter some text', 'error');
            return;
        }

        this.isLoading = true;

        try {
            const jsonString = await updateComment({
                commentId: commentId,
                newText: comment.editText
            });

            this.showToast('Success', 'Comment updated successfully', 'success');
            this.loadFeedItems();
        } catch (error) {
            this.showToast('Error', this.getErrorMessage(error), 'error');
        } finally {
            this.isLoading = false;
        }
    }
}