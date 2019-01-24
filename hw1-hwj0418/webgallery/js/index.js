/*jshint esversion: 6 */
(function(){
  "use strict";
  let comment_page = 0;
  let imageId = -1;
  window.onload = function(){
    empty_gallary();
    document.getElementById('new_img_form').addEventListener('submit', function(e){
      toggle("new_img_form");
      // prevent from refreshing the page on submit
      e.preventDefault();
      // read form elements
      let img_title = document.getElementById("img_title").value;
      let img_url = document.getElementById("img_url").value;
      let img_author = document.getElementById("img_author").value;
      // clean form
      document.getElementById("new_img_form").reset();
      api.addImage(img_title, img_author, img_url);
    });
    document.getElementById('new_post_btn').addEventListener('click',function(){
      toggle("new_img_form");
    });
    
    api.onImageUpdate(function(img){
      //console.log("current page is showing img:", img);
      
      if(!img){
        console.log("no element on the webpage, ask user to post an img");
        empty_gallary();
      }
      if(img){
        //console.log("intializing the whole page....");
        let elmt = document.createElement('div');
        document.querySelector('#post').innerHTML = '';
        document.querySelector('#comments').innerHTML = '';
        imageId = img.imageId;
        let url = img.url;
        let author = img.author;
        let date = img.date;
        let title = img.title;
        elmt.innerHTML=`
        <div id="new_post" class="btn_display">
            <button id="delete_img" class="btn">Delete Image</button>
        </div>
        <div class="post">
          <div class="switch_img">
            <img id="prev_img" class="icon" src="media/left.png">previous</img>
            <img src="${url}" class="post_img" id="post_image" alt=${imageId}>next</img>
            <img id="next_img" class="icon" src="media/right.png"></img>
          </div>
          <div class="post_title">${title}</div>
          <div class="post_author">By: ${author} on ${date}</div> 
          <form id="comment_form" class="complex_form">
            <input maxlength="10" id="comment_author" type="text" class="form_element" placeholder="Enter your name" name="title" required/>
            <textarea maxlength="500" rows="5" id="comment_content" type="text" class="form_element" placeholder="Comment this image" name="title" required/></textarea>
            <div class="btn_display" >
              <button id="post_comment" class="btn" type="submit">Post comment</button>
            </div>
          </form>
        </div>
        `;
        document.getElementById("post").prepend(elmt);
        document.getElementById("delete_img").addEventListener('click', function(e){
          e.preventDefault();
          //console.log("deleting img:", img.imageId);
          api.deleteImage(img.imageId);
        });
        document.getElementById("prev_img").addEventListener('click', function(e){
          //console.log("wanna go to the prev img with imgid:", imageId);
          e.preventDefault();
          comment_page = 0;
          api.switchPrevImg(imageId);
        });
        document.getElementById("next_img").addEventListener('click', function(e){
          e.preventDefault();
          //console.log("wanna go to the next img with imgid:", imageId);
          comment_page = 0;
          api.switchNextImg(imageId);
        });
        document.getElementById("comment_form").addEventListener('submit', function(e){
          e.preventDefault();
          let comment_author = document.getElementById("comment_author").value;
          let comment_content = document.getElementById("comment_content").value;
          //console.log("posting comment with:",imageId, comment_author, comment_content);
          document.getElementById("comment_form").reset();
          api.addComment(imageId, comment_author, comment_content);
        });
      };
    });//end on image update
    api.onCommentUpdate(function(comments){
      document.querySelector('#comments').innerHTML = '';
      //console.log("current page is showing comments:", comments);
      if(!comments) return null;
      let comment_switch_elmt = document.createElement('div');
      comment_switch_elmt.innerHTML=`
      <div class="switch_comment">
        <button id="previous_comment" type="submit">older comments</button>
        <button id="next_comment" type="submit" >later comments</button>
      </div>
      `;
      document.getElementById("comments").append(comment_switch_elmt);
      // if(api.getComments(imageId, comment_page-1) != -1){toggle(previous_comment)};
      // if(api.getComments(imageId, comment_page+1) != -1){toggle(next_comment)};
      comments.forEach(comment => {
        let comment_elmt = document.createElement('div');
        let comment_author = comment.author;
        let comment_content = comment.content;
        let comment_date = comment.date;
        let comment_id = comment.commentId;
        comment_elmt.innerHTML = `
        <div class="comments">
          <div class="author">
            <div class="comment_author">${comment_author}: </div>
            <div class="comment_date">${comment_date}</div>
          </div>
          <div class="comment_content">${comment_content}</div>
          <div id="delete_${comment_id}" >
            <img src="media/delete-icon.png"  class="icon"></img>
          </div>
        </div>
        `;
        document.getElementById("comments").prepend(comment_elmt);
        document.getElementById("delete_" + comment_id.toString()).addEventListener('click', function(e){
          e.preventDefault();
          console.log("deleting comment: " + comment_id);
          api.deleteComment(imageId, comment_id, comment_page);
        });
      });
      
      console.log("global id and page:",imageId, comment_page);
      document.getElementById("previous_comment").addEventListener('click', function(e){
        e.preventDefault();
        if(api.getComments(imageId, comment_page + 1).length > 0) {comment_page = comment_page + 1};
        api.switchComment(imageId, comment_page);
      });
      document.getElementById("next_comment").addEventListener('click', function(e){
        e.preventDefault();
        if(api.getComments(imageId, comment_page - 1).length > 0) {comment_page = comment_page - 1};
        api.switchComment(imageId, comment_page);
      });
    });//end on comment update

  }//end window onload

  function toggle(elem_id){
    let x = document.getElementById(elem_id);
    if (x.style.display == "none") {
      x.style.display = "flex";
    } else {
      x.style.display = "none";
    }
  }
  function empty_gallary(){
    document.querySelector('#post').innerHTML = '';
    document.querySelector('#comments').innerHTML = '';
    let elmt = document.createElement('div');
    elmt.innerHTML=`
    <div class="post_author">
    The gallery is currently empty, post a new image by clicking the 'Add Image' button on the top right.
    </div>
    `;
    document.getElementById("post").prepend(elmt);
  }

}());
