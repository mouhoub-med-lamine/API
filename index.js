const functions = require("firebase-functions");

var cors = require('cors')

const app = require("express")();

const  {admin,db}=require('./util/admin');
const FBAuth = require("./util/fbAuth");
const { getAllScreams,getownScreams,BeamUploadImage,getcomments,story,deletecomment, postOneScream,reepost, getScream, commentOnScream, likeScream, unlikeComment,likeComment,unlikeScream, deleteScream } = require("./handlers/publications");
const { signup, login, logout,recherche,getnotif , suggestions, uploadImage,getstory,deletestory,getArchivestory,debloquer, addUserDetails, getUserDetails, getAuthenticatedUser,SendFollowRequest,getabonnements,getabonnes ,desabonner ,getbloqued, bloquer} = require("./handlers/users");
const fbAuth = require("./util/fbAuth");

app.use(cors());


//routes des postes :
//avoir tt les publications
app.get('/publications',FBAuth, getAllScreams);
app.get('/publications/all',FBAuth, getownScreams);

//ajouter une publication sana photo
app.post('/publication', FBAuth, postOneScream);
app.post('/story', FBAuth, story);

app.get('/notifications' , FBAuth, getnotif );

app.get('/recherche', FBAuth , recherche);
app.get('/storys', FBAuth , getstory);
app.delete('/story/:storyId', FBAuth, deletestory);


app.get('/archives', FBAuth ,getArchivestory);

app.post('/publication/:screamId/repost', FBAuth, reepost);

//retourne la pub et ces infos
app.get('/publication/:screamId',FBAuth, getScream);

app.get('/suggestions', FBAuth, suggestions);
app.post('/user/:useruid/bloquer', FBAuth, bloquer);
app.delete('/user/:useruId', FBAuth, debloquer);

app.get('/comment/:screamId',FBAuth, getcomments);


app.get('/bloquer',FBAuth, getbloqued);
// add new comment 
app.post('/publication/:screamId/comment', FBAuth, commentOnScream);


app.delete('/publication/:screamId/:commentId', FBAuth, deletecomment);
// delete publication
app.delete('/publication/:screamId', FBAuth, deleteScream);
// like publication
app.post('/publication/:screamId/like', FBAuth, likeScream);
// unlike publication
app.post('/publication/:screamId/unlike', FBAuth, unlikeScream);


//like comment
app.post('/:screamId/:commentId/like', FBAuth, likeComment);
app.post('/:screamId/:commentId/unlike', FBAuth, unlikeComment);





//users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/logout', fbAuth ,logout);

// ajouter un post avec une photo
app.post('/pub', FBAuth, BeamUploadImage);

//ajouter la photo de profil
app.post('/user/image', FBAuth, uploadImage);
//ajout de details au profil
app.post('/user', FBAuth, addUserDetails);
//avoir les info de l'utilisateur
app.get('/user', FBAuth, getAuthenticatedUser);

app.get('/user/:userId' , FBAuth, getUserDetails);



// s'abonner 
app.post('/add',FBAuth,SendFollowRequest);
// se desabonner
app.post('/desabonner',FBAuth, desabonner);

app.get('/getabonnements',FBAuth,getabonnements);
app.get('/getabonnes',FBAuth,getabonnes);













exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions
  
  .firestore.document('beam/{screamId}/like/{likeId}')
  .onCreate((snapshot) => {
    return db
      .doc(`/beam/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userid !== snapshot.data().userid
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().pseudo,
            recipientId: doc.data().userid,
            sender: snapshot.data().pseudo,
            userImage: snapshot.data().userImage,
            senderid: snapshot.data().userid,
            type: 'like',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch((err) => console.error(err));
  });


  exports.deleteNotificationOnUnLike = functions
  
  .firestore.document('beam/{screamId}/like/{likeId}')
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });

  exports.deleteNotificationOnDeletComment = functions
  
  .firestore.document('beam/{screamId}/comments/{commentId}')
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });


  exports.createNotificationOnComment = functions
  .firestore.document('beam/{screamId}/comments/{commentId}')
  .onCreate((snapshot) => {
    return db
      .doc(`/beam/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userid !== snapshot.data().userid
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().pseudo,
            recipientId: doc.data().userid,
            sender: snapshot.data().pseudoUser,
            senderId: snapshot.data().userid,
            userImage: snapshot.data().userImage,
            type: 'comment',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch((err) => console.error(err));
  });
  // .firestore.document('comments/{id}')
  // .onCreate((snapshot) => {
  //   return db
  //     .doc(`/beam/${snapshot.data().screamId}`)
  //     .get()
  //     .then((doc) => {
  //       if (
  //         doc.exists &&
  //         doc.data().pseudo !== snapshot.data().pseudoUser
  //       ) {
  //         return db.doc(`/notifications/${snapshot.id}`).set({
  //           createdAt: new Date().toISOString(),
  //           recipient: doc.data().pseudo,
  //           sender: snapshot.data().pseudoUser,
  //           type: 'comment',
  //           read: false,
  //           screamId: doc.id
  //         });
  //       }
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       return;
  //     });
  // });
