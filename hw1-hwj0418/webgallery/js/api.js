/*jshint esversion: 6 */
let api = (function(){
    "use strict";
    let module = {};

    //creating local storage if not exist
    if (!localStorage.getItem('all_images')){
        localStorage.setItem('all_images', JSON.stringify({next: 0, items: []}));
    }

    /*  ******* Data types *******
        image objects must have at least the following attributes:
            - (String) imageId 
            - (String) title
            - (String) author
            - (String) url
            - (Date) date
            -（Array) comments
    
        comment objects must have the following attributes
            - (String) commentId
            - (String) imageId
            - (String) author
            - (String) content
            - (Date) date
    
    ****************************** */ 
    
    // add an image to the gallery
    module.addImage = function(title, author, url){
        //console.log("adding img to the local storage..", title, author, url);
        let imgs = JSON.parse(localStorage.getItem('all_images'));
        let today = new Date();
        let new_img = {imageId: imgs.next++, title: title, author: author, url: url, date: today.toLocaleDateString(), comments:[]};
        imgs.items.push(new_img);
        localStorage.setItem('all_images', JSON.stringify(imgs));
        notifyImgListeners(new_img.imageId);
        notifyCommentListeners(new_img.imageId);
    }
    
    // delete an image from the gallery given its imageId
    module.deleteImage = function(imageId){
        let imgs = JSON.parse(localStorage.getItem('all_images'));
        console.log("deleting img with id:",imageId, imgs.items);
        let index = imgs.items.findIndex(function(targetImg){
            return targetImg.imageId == imageId;
        });
        if (index == -1) return null;
        let prev_img = imgs.items[index - 1];
        let next_img = imgs.items[index + 1];
        imgs.items.splice(index, 1);
        localStorage.setItem('all_images', JSON.stringify(imgs))
        if(prev_img){
            notifyImgListeners(prev_img.imageId);
            notifyCommentListeners(prev_img.imageId);
        }else if(next_img){
            notifyImgListeners(next_img.imageId);
            notifyCommentListeners(next_img.imageId);
        }else{
            notifyImgListeners(null);
        }
        //notifyImgListeners(imageId);
        //notifyCommentListeners(next_img_index);
        
    }
    
    // get an image from the gallery given its imageId
    module.getImage = function(imageId){
        let imgs = JSON.parse(localStorage.getItem('all_images'));
        //console.log("in get img with, ", imageId, imgs.items);
        let index = imgs.items.findIndex(function(targetImg){
            return targetImg.imageId == imageId;
        });
        if (index == -1) return null;
        console.log("found img", imgs.items[index]);
        return imgs.items[index];
    }
    
    // add a comment to an image
    module.addComment = function(imageId, author, content){
        //console.log("adding comment:", imageId, author, content);
        let imgs = JSON.parse(localStorage.getItem('all_images'));
        let img_index = imgs.items.findIndex(function(targetImg){
            return targetImg.imageId == imageId;
        });
        if (img_index == -1) return null;
        let targetImg = imgs.items[img_index];
        let today = new Date();
        let new_comment = {commentId: targetImg.comments.length, imageId:imageId, author:author, content:content, date: today.toLocaleDateString()};
        targetImg.comments.push(new_comment);
        localStorage.setItem('all_images', JSON.stringify(imgs));
        notifyCommentListeners(imageId);
        //notifyImgListeners(imageId);
    }
    
    // delete a comment to an image
    module.deleteComment = function(imageId, commentId, page=0){
        let imgs = JSON.parse(localStorage.getItem('all_images'));
        let img_index = imgs.items.findIndex(function(targetImg){
            return targetImg.imageId == imageId;
        });
        if (img_index == -1) return null;
        let targetImg = imgs.items[img_index];
        let comments = targetImg.comments;
        let comment_index = comments.findIndex(function(targetComment){
            return targetComment.commentId == commentId;
        });
        targetImg.comments.splice(comment_index, 1);
        localStorage.setItem('all_images', JSON.stringify(imgs));
        notifyCommentListeners(imageId,page);
        //notifyImgListeners(imageId);
    }
    
    // return a set of 10 comments using pagination
    // page=0 returns the 10 latest messages
    // page=1 the 10 following ones and so on
    module.getComments = function(imageId, page=0){
        let imgs = JSON.parse(localStorage.getItem('all_images'));
        let img_index = imgs.items.findIndex(function(targetImg){
            return targetImg.imageId == imageId;
        });
        if (img_index == -1) return null;
        let targetImg = imgs.items[img_index];
        let comments = targetImg.comments;
        let ep = comments.length - page * 10;
        let sp = ep - 10;
        if(page < 0){
            console.log("invalide page input:", page);
            return -1;
        }
        if(sp < 0){
            sp = 0;
        }
        if(ep < 0){
            return -1;
        }
        console.log("returning comments:", comments.slice(sp, ep));
        return comments.slice(sp, ep);
    }

    module.switchNextImg = function(imageId){
        if(imageId == null) return -1;
        let imgs = JSON.parse(localStorage.getItem('all_images'));
        let target_img_index = imgs.items.findIndex(function(targetImg){
            return targetImg.imageId == imageId;
        });
        if (target_img_index == -1) return -1;
        let target_img = imgs.items[target_img_index + 1];
        if(target_img == null) return -1;
        notifyImgListeners(target_img.imageId);
        notifyCommentListeners(target_img.imageId);
    }

    module.switchPrevImg = function(imageId){
        if(imageId == null) return -1;
        let imgs = JSON.parse(localStorage.getItem('all_images'));
        let target_img_index = imgs.items.findIndex(function(targetImg){
            return targetImg.imageId == imageId;
        });
        if (target_img_index == -1) return -1;
        let target_img = imgs.items[target_img_index - 1];
        if(target_img == null) return -1;
        notifyImgListeners(target_img.imageId);
        notifyCommentListeners(target_img.imageId);
    }

    module.switchComment = function(imageId, page){
        
        let imgs = JSON.parse(localStorage.getItem('all_images'));
        let target_img_index = imgs.items.findIndex(function(targetImg){
            return targetImg.imageId == imageId;
        });
        if (target_img_index == -1) return -1;
        console.log("go to img:", imageId,"with page:", page);
        let target_img = imgs.items[target_img_index];
        if(target_img == null) return -1;
        notifyCommentListeners(target_img.imageId, page);
    }


    let imageListeners = [];
    function notifyImgListeners(imageId){
        //console.log("listenser was notified with img id:", imageId);
        imageListeners.forEach(function(listener){
            listener(api.getImage(imageId));
        });
    }

    // register an image listener
    // to be notified when an image is added or deleted from the gallery
    module.onImageUpdate = function(listener){
        imageListeners.push(listener);
        let imgs = JSON.parse(localStorage.getItem('all_images'));
        let max = imgs.items.length - 1;
        // console.log("in img update:", api.getImage(max), max)
        listener(imgs.items[max]);
    }


    let commentListeners = [];
    function notifyCommentListeners(imageId, page=0){
        commentListeners.forEach(function(listener){
            listener(api.getComments(imageId, page));
        });
    }

    // register an comment listener
    // to be notified when an comment is added or deleted from the gallery
    module.onCommentUpdate = function(listener){
        commentListeners.push(listener);
        let imgs = JSON.parse(localStorage.getItem('all_images'));
        let max = imgs.items.length - 1;
        console.log("in comment update", max);
        if(imgs.items[max]) listener(api.getComments(imgs.items[max].imageId));
    }

    return module;
})();