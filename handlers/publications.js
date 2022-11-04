
const { db,admin } = require('../util/admin');
const {buildFields} = require('./uid');
const config = require('../util/config.js');



exports.getAllScreams =  (req,res) => {
  let blk =[];
  let abn=[];

  db.doc(`/Users/${req.user.uid}`).collection('bloquer').get().then((data) => {
    data.forEach((doc) => {
      blk.push(doc.data().userId);
    
    })
      return blk;
  })
  db.doc(`/Users/${req.user.uid}`).collection('abonnements').get().then((data) => {
    data.forEach((doc) => {
      abn.push(doc.data().iduser);
    
    })
      return abn;
  })
  userid = req.user.uid;
  db.collection('beam').
        orderBy('createdAt', 'desc').
        get().
        then((data) => {
            let screams = [];
            let like;
            data.forEach((doc) => {
              us=doc.data().userid;
            if(us == req.user.uid){
             try {
              like = doc.data().like;
              if (like.indexOf(userid) == -1 ){
                isLiked = false;
              }else{
                isLiked = true; 
              }
              if(!doc.data().etat){
                screams.push({
                  posteId: doc.id,
                  body: doc.data().body,
                  createdAt: doc.data().createdAt,
                  userImage: doc.data().userImage,
                  email: doc.data().email,
                  userid: doc.data().userid,
                  Displayname: doc.data().Displayname,

                  commentCount: doc.data().commentCount,
                  likeCount: doc.data().likeCount,
                  image: doc.data().image,
                  pseudo :doc.data().pseudo,
                  repost:doc.data().repost,
                  isLiked,
                  own : true,
                  
                });
               }else{
                screams.push({
                  posteId: doc.id,
                  body: doc.data().body,
                  createdAt: doc.data().createdAt,
                  userImage: doc.data().userImage,
                  email: doc.data().email,
                  userid: doc.data().userid,
                  Displayname: doc.data().Displayname,

                  commentCount: doc.data().commentCount,
                  likeCount: doc.data().likeCount,
                  image: doc.data().image,
                  pseudo :doc.data().pseudo,
                  repost:doc.data().repost,
                  isLiked,
                  own : true,
                  

                  rebody: doc.data().rebody,
                  recreatedAt: doc.data().recreatedAt,
                  reuserImage: doc.data().reuserImage,
                  reemail: doc.data().reemail,
                  reuserid: doc.data().reuserid,
                  reDisplayname: doc.data().reDisplayname,
                  reimage: doc.data().reimage,
                  repseudo :doc.data().repseudo,
                  
                 
                });
               }
             } catch (error) {
               console.log(error)
             }
            }
            else{
            if (blk.indexOf(us) == -1){
                              try {
                                like = doc.data().like;
                                if (like.indexOf(userid) == -1 ){
                                  isLiked = false;
                                }else{
                                  isLiked = true; 
                                }
                                if(abn.indexOf(us) !== -1 ){
                                  if(!doc.data().etat){
                                    screams.push({
                                      posteId: doc.id,
                                      body: doc.data().body,
                                      createdAt: doc.data().createdAt,
                                      userImage: doc.data().userImage,
                                      email: doc.data().email,
                                      userid: doc.data().userid,
                                      Displayname: doc.data().Displayname,
    
                                      commentCount: doc.data().commentCount,
                                      likeCount: doc.data().likeCount,
                                      image: doc.data().image,
                                      pseudo :doc.data().pseudo,
                                      repost:doc.data().repost,
                                      isLiked,
                                      own : false,
                                      
                                    });
                                   }else{
                                    screams.push({
                                      posteId: doc.id,
                                      body: doc.data().body,
                                      createdAt: doc.data().createdAt,
                                      userImage: doc.data().userImage,
                                      email: doc.data().email,
                                      userid: doc.data().userid,
                                      Displayname: doc.data().Displayname,
    
                                      commentCount: doc.data().commentCount,
                                      likeCount: doc.data().likeCount,
                                      image: doc.data().image,
                                      pseudo :doc.data().pseudo,
                                      repost:doc.data().repost,
                                      isLiked,
                                      own : false,
                                      
    
                                      rebody: doc.data().rebody,
                                      recreatedAt: doc.data().recreatedAt,
                                      reuserImage: doc.data().reuserImage,
                                      reemail: doc.data().reemail,
                                      reuserid: doc.data().reuserid,
                                      reDisplayname: doc.data().reDisplayname,
                                      reimage: doc.data().reimage,
                                      repseudo :doc.data().repseudo,
                                      
                                     
                                    });
                                   }
                                }
                               
                                
                  
                                } catch (error) {
                                  console.log(error)
                                  
                                }

            }
            }
            })

            return res.json(screams);
        })
        .catch((err) =>{ console.error(err);
    res.status(500).json({ error: err.code });
});
}



exports.getownScreams = (req,res) => {
  db.collection('beam').where("userid", "==" , req.user.uid).orderBy('createdAt', 'desc').
      get().
      then((data) => {
          let screams = [];
          userid = req.user.uid;
          data.forEach((doc) => {
                like = doc.data().like;
                if (like.indexOf(userid) == -1 ){
                  isLiked = false;
                }else{
                  isLiked = true; 
                }
              screams.push({
                posteId: doc.id,
                body: doc.data().body,
                createdAt: doc.data().createdAt,
                userImage: doc.data().userImage,
                email: doc.data().email,
                pseudo: doc.data().pseudo,
                Displayname: doc.data().Displayname,

                commentCount: doc.data().commentCount,
                likeCount: doc.data().likeCount,
                image: doc.data().image,
                repost:doc.data().repost,
                isLiked
              });
          })
          return res.json(screams);
      })
      .catch((err) =>{ console.error(err);
  res.status(500).json({ error: err.code });
});
}

//publier un poste
exports.postOneScream = (req,res) => {

    if (req.body.body.trim() === '') {
        return res.status(400).json({ body: 'Body must not be empty' });
      }
     
    const newScream = {
        body: req.body.body,
        pseudo: req.user.pseudo,
        userImage: req.user.imageUrl,
        likeCount:0,
        like:[],
        commentCount:0,
        createdAt: new Date().toISOString(),
        email:req.user.email,
        Displayname: req.user.Displayname,
        userid: req.user.uid,
    };
    db.collection('beam')
        .add(newScream)
        .then((doc) => {
          
          const resScream = newScream;
         
          res.json(resScream);
        })
        .catch((err) => {
            res.status(500).json({ error: `somthing went wrong` });
            console.error(err);
 });
}


exports.reepost = (req,res) => {
  let bod = {};
  if(req.body.body){
    bod = {
      body: req.body.body
    }
  }
  


  us = req.params.screamId;
  let Pdata = {}
  let Data = {}
  const Sdata ={ 
    pseudo: req.user.pseudo,
    userImage: req.user.imageUrl,
    likeCount:0,
    like:[],
    commentCount:0,
    createdAt: new Date().toISOString(),
    email:req.user.email,
    Displayname: req.user.Displayname,
    userid: req.user.uid,
    etat: 'reepost'}
  
  
  
  
  db.collection('beam').doc(req.params.screamId).get().then((doc) => {
    if (doc.exists){
      repost = doc.data().repost+1;
      Pdata = {
        postId:doc.id,
        rebody: doc.data().body,
        repseudo: doc.data().pseudo,
        reuserImage: doc.data().userImage, 
        reimage: doc.data().image,
        recreatedAt: doc.data().createdAt,
        reemail:doc.data().email,
        reDisplayname: doc.data().Displayname,
        reuserid: doc.data().userid
      };
      Data = {...bod,...Pdata ,...Sdata};
      db.collection('beam').doc(req.params.screamId).update({repost});
      db.collection('beam')
          .add(Data)
          .then((doc) => {
            
            const resScream = Data;
           
            res.json(resScream);
          })
          .catch((err) => {
              res.status(500).json({ error: `somthing went wrong` });
              console.error(err);
          });
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).json({ error: err.code });
  });
  
 
}


exports.BeamUploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });

  let imageToBeUploaded = {};
  let imageFileName;
  const image ='';
  // String for image token


  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    console.log(fieldname, file, filename, encoding, mimetype);
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }
    // my.image.png => ['my', 'image', 'png']
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    // 32756238461724837.png
    imageFileName = `${Math.round(
      Math.random() * 1000000000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on('field', (field, val) => req.body = buildFields(req.body, field, val));
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        // Append token to url
        const image = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
            const newScream = {
              body: req.body.body,
              pseudo: req.user.pseudo,
              userImage: req.user.imageUrl,
              likeCount:0,
              like:[],
              commentCount:0,
              createdAt: new Date().toISOString(),
              email:req.user.email,
              Displayname: req.user.Displayname,
              userid: req.user.uid,
              image,
          };
          db.collection('beam')
              .add(newScream)
              .then((doc) => {
                
                const resScream = newScream;
              
                res.json(resScream);
              })
              .catch((err) => {
                  res.status(500).json({ error: `somthing went wrong` });
                  console.error(err);
          });

        return res.json({ message: "image uploaded successfully" });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: "something went wrong" });
      });
  });
  busboy.end(req.rawBody);



};


// les postes 
exports.getScream = (req, res) => {
  userid = req.user.uid;
  let screamData = {};
  db.doc(`/beam/${req.params.screamId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }
      like = doc.data().like;
      if (like.indexOf(userid) == -1 ){
        isLikedd = false;
      }else{
        isLikedd = true; 
      }
      screamData = doc.data();
      screamData.screamId = doc.id;
      screamData.isLiked = isLikedd;
      return db.doc(`/beam/${req.params.screamId}`).collection('comments')
        .orderBy('createdAt', 'desc')
        .get();
    })
    .then((data) => {
      screamData.comments = [];
      data.forEach((doc) => {
        screamData.comments.push(doc.data());
      });
      return res.json(screamData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.getcomments = (req, res) => {
  userid = req.user.uid;
  let com = {};
  db.doc(`/beam/${req.params.screamId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }
      
      return db.doc(`/beam/${req.params.screamId}`).collection('comments')
        .orderBy('createdAt', 'desc')
        .get();
    })
    .then((data) => {
      
      
      let dataa = {};
      let dataaa ={};
      com.comments = [];
      data.forEach((doc) => {
        like=doc.data().like;
        if(like.indexOf(req.user.uid) == -1){
          isLiked = false; 
        }else{
          isLiked = true;
        }
        dataa= doc.data();
        dataaa = {
          commentId : doc.id,
          isLiked
        }
        dataa={...dataaa,...dataa}
        
        com.comments.push(dataa);
      });
      return res.json(com);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};



//commenter 
exports.commentOnScream = (req, res) => {
  if (req.body.body.trim() === '')
    return res.status(400).json({ comment: 'Must not be empty' });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    pseudoUser: req.user.pseudo,
    Displayname: req.user.Displayname,
    userImage: req.user.imageUrl,
    like: [],
    likeCount: 0,
    email:req.user.email,
    userid: req.user.uid
  };
  console.log(newComment);

  db.doc(`/beam/${req.params.screamId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }else{
      doc.ref.update({ commentCount: doc.data().commentCount + 1 });
      return db.doc(`/beam/${req.params.screamId}`).collection('comments').add(newComment);}
    })
    .then(() => {
      res.json(newComment);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
};

exports.likeScream = (req, res) => {
  const beamDocument = db
    .doc(`/beam/${req.params.screamId}`)

  let like;
  const userid = req.user.uid;

  infoUser = {
    screamId: req.params.screamId,
    userid: req.user.uid,
    pseudo: req.user.pseudo,
    Displayname: req.user.Displayname,
    nom: req.user.nom,
    
    prenom: req.user.prenom,
    imageUrl: req.user.imageUrl,
  }

  beamDocument.get()
    .then((doc) => {
      if (doc.exists) {
        
        if ( doc.data().like.indexOf(userid) == -1 ){
          like=doc.data().like;
          like.push(req.user.uid);
          likeCount = doc.data().likeCount +1;
          db.doc(`/beam/${req.params.screamId}`).collection('like').add(infoUser);
          return beamDocument.update({
            likeCount,
            like
          });
          
          
        }else{
          return res.status(404).json({ error: 'already liked' }); 
        }
        
      } else {
        return res.status(404).json({ error: 'Scream not found' });
      }
    }).then(() => {
      return res.json({ message: `liked succesffuly `});
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.unlikeScream = (req, res) => {
  const beamDocument = db
  .doc(`/beam/${req.params.screamId}`)
  let like;
  const userid = req.user.uid;

  beamDocument.get()
    .then((doc) => {
      if (doc.exists) {
        if ( doc.data().like.indexOf(userid) == -1 ){
          return res.status(404).json({ error: ' post is not liked' }); 
        }else{
          like = doc.data().like;
          likeCount = doc.data().likeCount -1;
          var idx =  like.indexOf(`${userid}`);
          like.splice(idx, 1);
          db.doc(`/beam/${req.params.screamId}`).collection('like').where('userid', '==', req.user.uid).get().then((data) => {
            data.forEach((doc) => {
              likeid = doc.id;
            })
            db.doc(`/beam/${req.params.screamId}/like/${likeid}`).delete();
          });
          
          return beamDocument.update({
            likeCount,
            like
          });
          
        }
        
      } else {
        return res.status(404).json({ error: 'post not found' });
      }
    }).then(() => {
      return res.json({ message: `unliked succesffuly `});
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
 
};

exports.deleteScream = (req, res) => {
  const document = db.doc(`/beam/${req.params.screamId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }
      if (doc.data().email !== req.user.email ) {
        return res.status(403).json({ error: 'Unauthorized' });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: 'Scream deleted successfully' });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};



exports.likeComment = (req, res) => {
  const beamDocument = db
    .doc(`/beam/${req.params.screamId}/comments/${req.params.commentId}`)

  let like;
  const userid = req.user.uid;

  infoUser = {
    userid: req.user.uid,
    pseudo: req.user.pseudo,
  }

  beamDocument.get()
    .then((doc) => {
      if (doc.exists) {
        
        if ( doc.data().like.indexOf(userid) == -1 ){
          like=doc.data().like;
          like.push(req.user.uid);
          likeCount = doc.data().likeCount +1;
          db.doc(`/beam/${req.params.screamId}/comments/${req.params.commentId}/like/${req.user.uid}`).set({
            userid: req.user.uid,
            pseudo: req.user.pseudo,
          });
          return beamDocument.update({
            likeCount,
            like
          });
          
          
        }else{
          return res.status(404).json({ error: 'already liked' }); 
        }
        
      } else {
        return res.status(404).json({ error: 'Scream not found' });
      }
    }).then(() => {
      return res.json({ message: `liked succesffuly `});
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.unlikeComment = (req, res) => {
  const beamDocument = db
  .doc(`/beam/${req.params.screamId}/comments/${req.params.commentId}`)
  let like;
  const userid = req.user.uid;

  beamDocument.get()
    .then((doc) => {
      if (doc.exists) {
        if ( doc.data().like.indexOf(userid) == -1 ){
          return res.status(404).json({ error: ' post is not liked' }); 
        }else{
          like = doc.data().like;
          likeCount = doc.data().likeCount -1;
          var idx =  like.indexOf(`${userid}`);
          like.splice(idx, 1);
          db.doc(`/beam/${req.params.screamId}/comments/${req.params.commentId}/like/${req.user.uid}`).delete();
          return beamDocument.update({
            likeCount,
            like
          });
          
        }
        
      } else {
        return res.status(404).json({ error: 'post not found' });
      }
    }).then(() => {
      return res.json({ message: `unliked succesffuly `});
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
 
};

exports.deletecomment = (req, res) => {
  



  const document = db.doc(`/beam/${req.params.screamId}/comments/${req.params.commentId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'comment not found' });
      }
      if (doc.data().userid !== req.user.uid ) {
        return res.status(403).json({ error: 'Unauthorized' });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: 'comment deleted successfully' });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.story = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });

  let imageToBeUploaded = {};
  let imageFileName;
  const image ='';
  // String for image token


  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    console.log(fieldname, file, filename, encoding, mimetype);
    if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
      return res.status(400).json({ error: "Wrong file type submitted" });
    }
    // my.image.png => ['my', 'image', 'png']
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    // 32756238461724837.png
    imageFileName = `${Math.round(
      Math.random() * 1000000000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on('field', (field, val) => req.body = buildFields(req.body, field, val));
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        // Append token to url
        const image = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
            const newstory = {
              body: req.body.body,
              pseudo: req.user.pseudo,
              userid: req.user.uid,
              Displayname: req.user.Displayname,
              email:req.user.email,
              userImage: req.user.imageUrl,
              createdAt: new Date().getTime(),   
              time: new Date().toDateString(),
              image,
          };
          db.collection('story')
              .add(newstory)
              .then((doc) => {
              
              })
              .catch((err) => {
                console.error(err);
                  return res.status(500).json({ error: `somthing went wrong` });
                  
          });

        return res.json({ message: "image uploaded successfully" });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: "something went wrong" });
      });
  });
  busboy.end(req.rawBody);



};
