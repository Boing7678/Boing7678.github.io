function isEmptyOrSpaces(str) {
    return str === null || str.match(/^ *$/) !== null;
}

$(".review-button").click(function () {
    $("#review-alert").hide();
    var url = $(this).attr('href');
    var redirect = $(this).hasClass("review-redirect");
    if (redirect) {
        window.location = url;
    }
    else {
        var request = $.post(url)
            .done(function (data) {
            })
            .fail(function () {
                alert("Unfortunately, something failed. I'm sorry about that.");
            });
    }
    return false;
});

var initPostComments = function (commentId) {
    var commentHash = window.location.hash;
    if (commentHash && commentHash.match("^#comment-")) {
        commentHash = commentHash.replace("#comment-", "");
        var highlightedCommentId = parseInt(commentHash);
        $("#comment-" + highlightedCommentId).addClass("highlighted");
    }

    $(".comment-reply-button").click(function () {
        // $("body").scrollTo("#comment-box");
        $("#comment-box").get(0).scrollIntoView();
        var userName = $(this).data("user");
        var text = $("#comment-text").val();
        $("#comment-text").val(text + "@" + userName + " ");
        $("#comment-text").focus();
        return false;
    });

    var submittingComment = false;
    $("#submit-comment").click(function () {
        var commentText = $("#comment-text").val();
        if (isEmptyOrSpaces(commentText)) {
            alert("Please enter a comment before submitting.");
            return false;
        }

        if (submittingComment) {
            return false;
        }

        submittingComment = true;
        var button = this;
        $(button).text('Submitting...');
        var url = $(this).attr('href');
        var request = $.post(url, { text: commentText })
            .done(function (data) {
                if (data === '1') {
                    window.location.reload();
                }
                else {
                    alert(data);
                }
            })
            .fail(function () {
                alert("Failed to submit comment. Please try again later.");
            })
            .always(function () {
                submittingComment = false;
                $(button).text('Submit');
            });

        return false;
    });

    $(".delete-all-by-user").click(function () {
        var url = "/Post/DeleteAllCommentsByUser";
        if ($(this).hasClass("deleted") === false) {
            if (confirm("This will remove all comments on this post by this user. Are you sure?") === false) {
                return false;
            }

            var userId = $(this).data("user-id");
            var postId = $(this).data("post-id");
            var request = $.post(url, { userId: userId, postId: postId })
                .done(function (data) {
                    if (data === '1') {
                        window.location.reload();
                    }
                    else {
                        alert("Failed to remove. Please try again later.");
                    }

                })
                .fail(function () {
                    alert("Failed to remove. Please try again later.");
                });
        }

        return false;
    });

    $(".delete-item").click(function () {
        var url = "/Post/DeleteComment";
        if ($(this).hasClass("deleted") === false) {
            if (confirm("Are you sure you wish to remove this?") === false) {
                return false;
            }

            var comment = $(this).closest(".comment").parent();
            var item = this;
            var itemId = $(this).data("item-id");
            var request = $.post(url, { id: itemId })
                .done(function (data) {
                    if (data === '1') {
                        $(item).addClass("deleted");
                        $(comment).hide(250);
                    }
                    else {
                        alert("Failed to remove. Please try again later.");
                    }

                })
                .fail(function () {
                    alert("Failed to remove. Please try again later.");
                });
        }

        return false;
    });

    $(".report-comment").click(function () {
        var url = "/Post/ReportComment";
        if ($(this).hasClass("reported") === false) {
            var text = prompt('Please describe why you are reporting this comment to help the moderators understand the issue.');
            if (text) {
                var item = this;
                var itemId = $(this).data("item-id");
                var request = $.post(url, { itemId: itemId, reason: text })
                    .done(function (data) {
                        if (data === '1') {
                            $(item).prop('title', 'You have reported this as inappropriate.');
                            $(item).addClass("reported");
                            $(item).text("Reported");
                        }
                        else {
                            alert("Failed to report. Please try again later.");
                        }

                    })
                    .fail(function () {
                        alert("Failed to report. Please try again later.");
                    });
            }
        }

        return false;
    });

    var submittingCommentUpvote = false;
    $(".upvote-comment").click(function () {
        if (!submittingCommentUpvote) {
            submittingCommentUpvote = true;
            $(this).toggleClass("upvoted");

            var comment = $(this).closest(".comment");
            var commentId = comment.data("id");
            var upvoteDisplay = comment.find(".comment-upvote-display");

            var numUpvotes = comment.data("upvotes");

            var addUpvote = $(this).hasClass("upvoted");
            if (addUpvote) {
                numUpvotes++;
            }
            else if (numUpvotes > 0) {
                numUpvotes--;
            }

            comment.data("upvotes", numUpvotes);
            if (numUpvotes > 0) {
                upvoteDisplay.text("+" + numUpvotes);
                upvoteDisplay.show(250);
            }
            else {
                upvoteDisplay.text("");
                upvoteDisplay.hide();
            }

            var url = $(this).attr('href');
            var request = $.post(url, { commentId: commentId, active: addUpvote })
                .always(function () {
                    setTimeout(function () {
                        submittingCommentUpvote = false;
                    }, 1000);
                });
        }
        else {
            alert("Still working on your last upvote. Just need a few more seconds. Thanks!");
        }

        return false;
    });

    var postCommentUpvoteIds = $("#user-post-comment-upvotes").text().split(',');
    $.each(postCommentUpvoteIds, function (index, value) {
        if (value) {
            $(".comment[data-id=" + value + "] .upvote-comment").addClass("upvoted");
        }
    });

    $("#sort-comments-new").click(function () {
        $("#sort-comments-new").addClass("btn-primary");
        $("#sort-comments-top").removeClass("btn-primary");
        $('.comment.sortable').sort(function (a, b) {
            if (b.dataset.pinned !== a.dataset.pinned) {
                return b.dataset.pinned - a.dataset.pinned;
            }
            else {
                return b.dataset.id - a.dataset.id;
            }
        }).each(function () {
            $(this).parent().appendTo(".comments");
        });
        return false;
    });

    $("#sort-comments-top").click(function () {
        $("#sort-comments-new").removeClass("btn-primary");
        $("#sort-comments-top").addClass("btn-primary");
        $('.comment.sortable').sort(function (a, b) {
            if (b.dataset.pinned !== a.dataset.pinned) {
                return b.dataset.pinned - a.dataset.pinned;
            }
            else if (b.dataset.upvotes !== a.dataset.upvotes) {
                return b.dataset.upvotes - a.dataset.upvotes;
            }
            else {
                return b.dataset.id - a.dataset.id;
            }
        }).each(function () {
            $(this).parent().appendTo(".comments");
        });
        return false;
    });

    var subscribing = false;
    $("#subscribe-button").click(function () {
        if (subscribing) {
            return false;
        }

        subscribing = true;
        var url = $(this).attr('href');
        var request = $.post(url)
            .done(function (data) {
                if (data === '1') {
                    $("#subscribe-button").removeClass("btn-dark");
                    $("#subscribe-button").addClass("btn-primary");
                }
                else if (data === '0') {
                    $("#subscribe-button").addClass("btn-dark");
                    $("#subscribe-button").removeClass("btn-primary");
                }
                else {
                    alert("Request failed. Please try again later.");
                }
            })
            .fail(function () {
                alert("Request failed. Please try again later.");
            })
            .always(function () {
                subscribing = false;
            });
        return false;
    });

    $(".comment-body").each(function () {
        var oldHtml = $(this).html();
        var regex = /([^\w])(@(\w+))/ig;
        var newHtml = oldHtml.replace(regex, "$1<a href='/u/$3'>$2</a>");
        $(this).html(newHtml);
    });
};
