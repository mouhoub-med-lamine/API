const { user } = require("firebase-functions/lib/providers/auth");

const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else return false;
}
//nom
const isNom = (nom) => {
    const regEx = /^[A-Za-z\é\è\ê\-]+$/;
    if (nom.match(regEx)) return true;
    else return false;
}
//prenom
const isPrenom = (prenom) => {
    const regEx = /^[A-Za-z\é\è\ê\-]+$/;
    if (prenom.match(regEx)) return true;
    else return false;
}
//pwd /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8})$/;      /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/;
const isMdp = (password) => {
    const regEx =/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/;
    if (password.match(regEx)) return true;
    else return false;}
    

const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
}
exports.validateSignupData =(data)=>{
    let errors = {};
    if (isEmpty(data.email)) {
        errors.email = ' Must not be empty'
    }
    else if (!isEmail(data.email)) {
        errors.email = 'Must be a valid email adress';
    }
//nom
    if (isEmpty(data.nom)) {
        errors.nom = 'Must not be empty'} 
    else if (!isNom(data.nom)) {
        errors.nom = 'Must be a valid name';
    }
    //prenom
    if (
        isEmpty(data.prenom)) {errors.prenom = 'Must not be empty'} 
    else if (!isPrenom(data.prenom)) {
        errors.prenom = 'Must be a valid prenom';
    }
//mdp
    if (isEmpty(data.password)) {errors.password = 'Must not be empty'}
    else if (!isMdp(data.password)) {
        errors.password = 'Must be a valid password';
    }
    
//mdp and confirmMdp
    if (data.password !== data.confirmPassword) errors.confirmPassword = "passwords must match";
    
    


   
    return{
        errors,
        valid:Object.keys(errors).length ===0 ?true:false
    }
}
exports.validateloginData= (data)=>{
    let errors = {};
    if (isEmpty(data.email)) errors.email = 'Must not be empty';
    if (isEmpty(data.password)) errors.password = 'Must not be empty';
     
      
    return{
        errors,
        valid:Object.keys(errors).length === 0 ?true:false
    }
}
exports.reduceUserDetails = (data) => {
    let userDetails = {};
    if (!isEmpty(data.dateNaissance)) userDetails.dateNaissance=data.dateNaissance;
    if (!isEmpty(data.bio)) userDetails.bio = data.bio;
  
    return userDetails;
  };