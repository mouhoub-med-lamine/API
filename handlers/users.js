const { db, admin } = require('../util/admin');
const config = require('../util/config.js');


const firebase = require('firebase');

const { validateSignupData, validateloginData, reduceUserDetails } = require('../util/validators');
const { user, UserBuilder } = require('firebase-functions/lib/providers/auth');
const { story } = require('./publications');
const { raw } = require('express');
const { randomInt } = require('crypto');
firebase.initializeApp(config);



exports.signup = (req, res) => {
  const newuser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    nom: req.body.nom,
    prenom: req.body.prenom,
    pseudo: req.body.pseudo,

  };
  const { valid, errors } = validateSignupData(newuser);
  if (!valid) return res.status(400).json(errors);

  const noImg = "no-img.png";

  let token, userId;
  db.doc(`/Users/${user.uid}`).get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ email: 'this email is already taken' });
      }
      else {
        return firebase.auth().createUserWithEmailAndPassword(newuser.email, newuser.password)
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((IdToken) => {
      token = IdToken;
      const userCredentials = {
        email: newuser.email,
        nom: newuser.nom,
        prenom: newuser.prenom,
        pseudo: newuser.pseudo,
        Displayname: newuser.nom+' '+newuser.prenom,
        isOnLign: true,
        createdat: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
        userId,
        bio: 'aucune biographie fournie',
        dateNaissance: 'non renseignée',
      }

      return db.doc(`/Users/${userId}`).set(userCredentials);

    })
    .then(() => {
      return res.status(201).json({ token })
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: 'this email is already taken' });
      } else {
        return res.status(500).json({ general : "somthing went wrong, please try again !" });
      }

    });
};



exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };
  const { valid, errors } = validateloginData(user);
  if (!valid) return res.status(400).json(errors);
  let userId;

  isOnLign = true;

  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      userId = data.user.uid;
      db.doc(`/Users/${userId}`).update({ isOnLign });
      return data.user.getIdToken();
      
    })
    .then((token) => {
      
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      return res.
        status(403).json({ general: 'wrong credentials,please try again' })
    });
    
};


exports.logout = (req, res) =>{
  const em = req.user.email;
  isOnLign = false;
  db.doc(`/Users/${req.user.uid}`).update({ isOnLign });
  firebase.auth().signOut().then(() => {
    return  res.status(200).json('logout succcesfuly');
  });
}




exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  db.doc(`/Users/${req.user.uid}`)
    .update(userDetails)
    .then(() => {
      return res.json({ message: "Details added successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};




exports.getUserDetails = (req, res) => {
  idd = req.params.userId;
  let userData = {};
  let abn=[];
  db.doc(`/Users/${req.user.uid}`).collection('abonnements').get().then((data) => {
    data.forEach((doc) => {
      abn.push(doc.data().iduser);
    
    })
      return abn;
  })
  db.doc(`/Users/${req.params.userId}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.user = doc.data();
        return db
          .collection("beam")
          .where("userid", "==", idd)
          .orderBy("createdAt", "desc")
          .get();
      } else {
        return res.status(404).json({ errror: "User not found" });
      }
    })
    .then((data) => {
      if (abn.indexOf(idd) !== -1){
      userData.screams = [];
      data.forEach((doc) => {
        like = doc.data().like;
        if (like.indexOf(req.user.uid) == -1 ){
          isLiked = false;
        }else{
          isLiked = true; 
        }
        if(!doc.data().etat){
          userData.screams.push({
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
            
          });
         }else{
          userData.screams.push({
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
        });}
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};



exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  db.doc(`/Users/${req.user.uid}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.credentials = doc.data();
      return res.json(userData);}
    })
    

  };

exports.bloquer = (req, res) =>{
  const userrID = req.params.useruid;
  let userData = {};
  

  db.doc(`/Users/${req.user.uid}`).collection('bloquer').get().then((data) => {
    data.forEach((doc) => {
      if (doc.data().userId == userrID){
       blocked = true;
      res.status(400).json({ error : "already bloqued" });
      }else {
        blocked = false;
      }
    })
    return blocked;
  }).then(() => {
    if (blocked == false){
      db.doc(`/Users/${userrID}`).get().then((doc) => {
        if (doc.exists){
          userData= doc.data();
        }
        db.doc(`/Users/${req.user.uid}`).collection('bloquer').add(userData);
      })
       res.status(200).json({ success: " bloqued succsesfuly" });
    }
  }).catch((err) => {
    console.error(err);
    res.status(500).json({ error: err.code });
  });

  // db.collection('bloquer')
  // .where("email" , "==", userrID )
  // .where("prop" , "==" , req.user.email).get().then((doc) =>{
  //   if(doc.size > 0){
  //       return res.status(400).json("this user is already bloked")
  //   }else{
  //     db.doc(`/Users/${userrID}`)
  //     .get()
  //     .then((doc) => {
  //       if (doc.exists) {
  //         userData = doc.data();
  //         userData.prop = req.user.email;
  //         return db.collection('bloquer').add(userData);
  //       }
  //     })
  //     return res.status(200).json('user blocked successfuly')
  //   }
  // })
  

}

exports.getbloqued = (req, res) => {
  
  let bloked = {};
  db.doc(`/Users/${req.user.uid}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return db.doc(`/Users/${req.user.uid}`).collection('bloquer').get();
    })
    .then((data) => {
      bloked.user = [];
      data.forEach((doc) => {
        bloked.user.push(doc.data());
      });
      return res.json(bloked);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};


exports.debloquer = (req, res) => {

  db.doc(`/Users/${req.user.uid}`).collection('bloquer')
    .get()
    .then((data) => {
      del = false;
      data.forEach((doc) => {
        if (doc.data().userId == req.params.userId ) {
          docc = doc.id;
          del = true;
          db.doc(`/Users/${req.user.uid}/bloquer/${docc}`).delete(); 
        } 
      })
    })
    .then(() => {
      if (del == true){
      res.json({ message: 'user deblocked successfully' });
    } else {
      res.json({ message: 'user is not blocked' });
    }
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};


exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: req.headers });

  let imageToBeUploaded = {};
  let imageFileName;
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
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        db.collection('beam').where('userid', '==', req.user.uid).get().then((data) => {
          data.forEach((doc) =>{
            idd= doc.id;
            db.doc(`/beam/${idd}`).update({ imageUrl });
          })
        })
        db.doc(`/Users/${req.user.uid}`).update({ imageUrl });
        return db.doc(`/Users/${req.user.uid}`).update({ imageUrl });
      })
      .then(() => {
        return res.json({ message: "image uploaded successfully" });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: "something went wrong" });
      });
  });
  busboy.end(req.rawBody);
};


exports.suggestions = (req,res) => {
  let userid;
  let blk =[];
  let seg =[];
  let row =[];


  db.doc(`/Users/${req.user.uid}`).collection('bloquer').get().then((data) => {
    data.forEach((doc) => {
      blk.push(doc.data().userId);
    
    })
      return blk;
  })
  

  db.collection('Users').orderBy('createdat','desc').limit(10).get().
  then((data) => {
      let seggest = [];
      data.forEach((doc) => {
        userid= doc.data().userId;
        
         if (userid !== req.user.uid){
          if (blk.indexOf(userid) == -1){
            seggest.push({
              userId: doc.id,
              pseudo: doc.data().pseudo,
              nom: doc.data().nom,
              Displayname: doc.data().Displayname,
              email: doc.data().email,
              createdat: doc.data().createdat,
              userImage: doc.data().imageUrl
            });
          } 
        }
      })
      return res.json(seggest);
  }).catch((err) =>{ console.error(err);
  res.status(500).json({ error: err.code });
});
}


exports.recherche = (req,res) => {

  body = req.body.body;
  let rech=[]; 
  db.collection('Users').get().then((data) => {
      data.forEach((doc) => {
        if (body === doc.data().pseudo || body === doc.data().Displayname)
        {
          rech.push(doc.data())
        }
      })
    
    if(rech.length == 0){
      return res.json({ message: "aucun utilisateur trouver " });
    }else {
      return res.json(rech)
    }
  }).catch((e) => {
    console.error(e);
    return res.status(500).json({ error: "something went wrong" });
  });
}


// add to follower liste
exports.SendFollowRequest = (req, res) => {
  let FollowRequest = { 
    id: req.user.uid,
    pseudo:req.user.pseudo,
    AccountName: req.body.AccountName,
    AccountUid: req.body.AccountUid,
    date: new Date().toISOString(),
  };
  date= new Date().toISOString()
  let usss = {
    iduser: req.user.uid,
    pseudo:req.user.pseudo,
    nom:req.user.nom,
    prenom:req.user.prenom,
    imageUrl:req.user.imageUrl,
    Displayname:req.user.Displayname,
    date
    
  }
  
  
  db.collection('followRequest')
    .where("id", "==", FollowRequest.id )
    .where("AccountUid", "==", FollowRequest.AccountUid)
    .get()
    .then((doc) => {
      if (doc.size > 0) {
        res.status(501).json({ error: "request already sent" });
      } else {
        db.collection("followRequest")
          .add(FollowRequest)
          .then((doc) => {
            db.doc(`/Users/${FollowRequest.AccountUid}`).get().then((doc) =>{
             dd=({
              iduser: doc.id,
              pseudo:doc.data().pseudo,
              nom:doc.data().nom,
              prenom:doc.data().prenom,
              imageUrl:doc.data().imageUrl,
              Displayname:doc.data().Displayname,
              date
             });
             db.doc(`/Users/${FollowRequest.AccountUid}/abonnes/${req.user.uid}`).set(usss);
             db.doc(`/Users/${FollowRequest.id}/abonnements/${FollowRequest.AccountUid}`).set(dd);
            })
            
            return res.status(200).json({ success: " following request sent" });
          })
          .catch((e) => {
            console.error(e);
            return res.status(500).json({ error: "something went wrong" });
          });
      }
    })
    .catch((e) => {
      console.error(e);
      return res.status(500).json({ error: "something went wrong" });
    });

    



};




exports.desabonner = (req, res) => {

  const desa = {
    id: req.user.uid,
    pseudo:req.user.pseudo,
    AccountUid: req.body.AccountUid,
  }
  
  db.collection(`/Users/${desa.id}/abonnements`).where("iduser", "==", desa.AccountUid).get().then((doc) => {
    doc.forEach((doc) => {
      did = doc.id;
    })
    
    if (doc.size > 0){
    
    db.collection(`/Users/${desa.id}/abonnements`).doc(`${did}`).delete().then(() =>{

      db.collection(`/Users/${desa.AccountUid}/abonnes`).where("iduser", "==", desa.id).get().then((doc) => {
        doc.forEach((doc) => {
          di = doc.id;
        })
        
        if (doc.size > 0){
        
        db.collection(`/Users/${desa.AccountUid}/abonnes`).doc(`${di}`).delete().then(() =>{ 
        });
        
        }
        else {
          return res.status(200).json('vous ne suivez pas cette personne')
        }
        return res.status(200).json({unfollow : 'unfollow successfuly'});
      })

      
      
    });
    
    }
    else {
      return res.status(200).json('vous ne suivez pas cette personne')
    }
  })
  .catch((e) => {
  console.error(e);
  return res.status(500).json({ error: "something went wrong" });
  });

  db.collection("followRequest")
    .where("id", "==", desa.id)
    .where("AccountUid", "==", desa.AccountUid)
    .get()
    .then((doc) => {
      doc.forEach((doc) => {
        d = doc.id;
      })
        if (doc.size > 0) {
          db.collection("followRequest")
          .doc(d)
          .delete()
          .then(() => {
            db.collection("follows").get().then((doc) => {
              doc.forEach((doc) => {
                de = doc.id;
              })
              if (doc.size > 0){
                db.collection("followRequest")
              .doc(d)
              .delete()
              .then(() =>{})
              }


            })

          })

        }

    })  
};




exports.getabonnements=(req,res)=>{
  db.
  collection(`/Users/${req.user.uid}/abonnements`).
  orderBy('date', 'desc').
  get().
  then((data) => {
      let abonnements = [];
      data.forEach((doc) => {
          abonnements.push({
            abonnementsId: doc.data().iduser,
            pseudo: doc.data().pseudo,
          });
      })
      return res.json(abonnements);
  })
  .catch((err) =>{ console.error(err);
res.status(500).json({ error: err.code });
});
}  


exports.getabonnes=(req,res)=>{
  db.
  collection(`/Users/${req.user.uid}/abonnes`).
  orderBy('date', 'desc').
  get().
  then((data) => {
      let abonnes = [];
      data.forEach((doc) => {
          abonnes.push({
            abonnesId: doc.data().iduser,
            pseudo: doc.data().pseudo,
          });
      })
      return res.json(abonnes);
  })
  .catch((err) =>{ console.error(err);
res.status(500).json({ error: err.code });
});
}  



exports.getstory=(req,res)=>{
  // let finn={};
  
  // db.doc(`/Users/${req.user.uid}`).collection('abonnements').get().then((data) => {
  //   let users={}
  //   data.forEach((doc) => {
  //     u={ U: doc.data()}
  //     users = {...u}
  //     id = doc.data().iduser;
  //     db.collection('story').orderBy('time','desc').get().then((data) =>{
  //       users.str=[];
  //       data.forEach((doc) =>{
  //         users.str.push(doc.data());
  //       })
  //       return users;
  //     })
  //     finn={...users}
  //     return finn;
  //   })
  //   return res.json(users);
  // })


  finn = [];
  let users={}
 

  
  let abn=[];
  db.doc(`/Users/${req.user.uid}`).collection('abonnements').get().then((data) => {
    data.forEach((doc) => {
      abn.push(doc.data().iduser);
    
    })
    db.collection(`story`).orderBy('userid','asc').orderBy('createdAt','desc').get().then((data) => {
    
 
      data.forEach((doc) => {
        storyid = doc.id;
        id = doc.data().userid;
        try {
            
          now  = new Date().getTime();
          n = now-86400000;
          timed = doc.data().createdAt;
                                                                  
          if (timed > n){
           if(doc.data().userid == req.user.uid){  
           users = {
             storyid,
             body: doc.data().body,
             image: doc.data().image,
             time: doc.data().time,
    
             pseudo: doc.data().pseudo,
             userImage: doc.data().userImage,
             
             
             userid: doc.data().userid,
             Displayname: doc.data().Displayname,
             email: doc.data().email,
            
           }
           finn.push(users);}
          }
        
        } catch (error) {
          console.log(error);
        }
     
      })
      return finn;
    
    })
  
  db.collection(`story`).orderBy('userid','asc').orderBy('createdAt','desc').get().then((data) => {
  
   
    data.forEach((doc) => {
      storyid = doc.id;
      id = doc.data().userid;
      try {
          
        now  = new Date().getTime();
        n = now-86400000;
        timed = doc.data().createdAt;
                                                                
        if (timed > n){
         if(abn.indexOf(id) !== -1 && doc.data().userid !== req.user.uid){  
         users = {
           storyid,
           body: doc.data().body,
           image: doc.data().image,
           time: doc.data().time,
  
           pseudo: doc.data().pseudo,
           userImage: doc.data().userImage,
           
           
           userid: doc.data().userid,
           Displayname: doc.data().Displayname,
           email: doc.data().email,
         }
         finn.push(users);}
        }
      
      } catch (error) {
        console.log(error);
      }
   
    })
    return res.json(finn)
  
  })
  })


} 


exports.getArchivestory=(req,res)=>{
  db.
  collection(`story`).where('userid' , '==' , req.user.uid).
  get().
  then((data) => {
      let story = [];
      
      data.forEach((doc) => {
         
          now  = new Date().getTime();
          n = now-86400000;
          timed = doc.data().createdAt;
          
          if (timed < n){
            story.push({
             image: doc.data().image,
             Displayname: doc.data().Displayname,
             userImage: doc.data().userImage,
             pseudo: doc.data().pseudo,
             body: doc.data().body,
             time: doc.data().time
            })
          }
      })
      return res.json(story);
  })
  .catch((err) =>{ console.error(err);
res.status(500).json({ error: err.code });
});
} 

exports.deletestory = (req, res) => {

  const document = db.doc(`/story/${req.params.storyId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'story not found' });
      }
      if (doc.data().userid !== req.user.uid ) {
        return res.status(403).json({ error: 'Unauthorized' });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: 'story deleted successfully' });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};


exports.getnotif = (req,res) => {
  db.collection('notifications').where("recipientId", "==" , req.user.uid).orderBy('createdAt', 'desc').
      get().
      then((data) => {
          let notif = [];
          
          data.forEach((doc) => {

              notif.push({
                notifId: doc.id,
                type: doc.data().type,
                createdAt: doc.data().createdAt,
                userImage: doc.data().userImage,
                senderId: doc.data().senderId,
                sender: doc.data().sender,
                pseudo: doc.data().pseudo,
                Displayname: doc.data().Displayname,

                screamId: doc.data().screamId,
              });
          })
          return res.json(notif);
      })
      .catch((err) =>{ console.error(err);
  res.status(500).json({ error: err.code });
});
}

// db.collection('story').orderBy('time' , 'desc').get().then((data) => {
//   let users=[];
//   data.forEach((doc) => {
//     idd= doc.id;
//     let storys= [];
      
//         let dataa = ({
//           storyId: idd,
//           Displayname: doc.data().Displayname,
//           email: doc.data().email,
//           pseudo: doc.data().pseudo,
//           image: doc.data().image,
//           body: doc.data().body,
//           createdAt: doc.data().createdAt,
//           userImage: doc.data().userImage,
//           userid: doc.data().userid,
//         });
       
//     storys.push(dataa) ; 
  
//   })
//   return res.json(users);
// })