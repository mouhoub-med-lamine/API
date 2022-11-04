const{admin,db}=require('./admin');

module.exports  = (req, res, next) => {
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
        

    }
    else {
        console.error('no token found');
        return res.status(403).json({ error: 'Unauthorized' });
    }
    admin.auth().verifyIdToken(idToken)
        .then((decodedToken )=> {
            req.user = decodedToken;
            
            return db.collection('Users')
                .where('email', "==", req.user.email)
                .limit(1)
                .get()
        })
        .then((data) => {
            req.user.email = data.docs[0].data().email;
            req.user.nom = data.docs[0].data().nom;
            req.user.prenom = data.docs[0].data().prenom;
            req.user.pseudo = data.docs[0].data().pseudo;
            req.user.imageUrl = data.docs[0].data().imageUrl;
            req.user.Displayname = data.docs[0].data().Displayname;
            req.user.universite = data.docs[0].data().universite;
            req.user.adresse = data.docs[0].data().adresse;
            req.user.bio = data.docs[0].data().bio;
         
            return next();
        })
        .catch((err) => {
            console.error('error while verifying token', err);
            return res.status(403).json(err);
        })


}