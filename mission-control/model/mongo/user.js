const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// define schema
const UserSchema = new Schema({

  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String },
  date_created: Date,
  last_active: Date,
  disabled: { type: Boolean },
  support_enabled: { type: Boolean, required: true },
  '2fa_enabled': { type: Boolean, required: true },
  '2fa_secret': { type: String, required: false },
  '2fa_backup_code': { type: String, required: false },
  default_account: { type: String, required: true },
  facebook_id: { type: String },
  twitter_id: { type: String },
  account: { type: Array },
  verified: { type: Boolean, required: true }

});

const User = mongoose.model('User', UserSchema, 'user');
exports.schema = User;

/*
* user.create()
* create a new user 
*/

exports.create = async function({ user, account }){
  
  const data = {

    id: uuidv4(),
    name: user.name,
    email: user.email,
    date_created: new Date(),
    last_active: new Date(),
    support_enabled: false,
    '2fa_enabled': false,
    facebook_id: user.facebook_id,
    twitter_id: user.twitter_id,
    default_account: account,
    verified: user.verified

  }
  
  // encrypt password
  if (user.password){

    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(user.password, salt);

  }

  const newUser = User(data);
  await newUser.save();

  if (data.password){

    delete data.password;
    data.has_password = true;

  }
  
  data.account_id = account;
  return data;

}

/*
* user.get()
* get a user by email or user id
*/

exports.get = async function({ id, email } = {}){

  return await User.find({

    ...id && { 'id': id },
    ...email && { 'email': email },
    
  }).select({ _id: 0, __v: 0, password: 0, });
}

/*
* user.update()
* update the user profile
* profile: object containing the user data to be saved
*/


exports.update = async function({ id, data }){

  await User.findOneAndUpdate({ id: id }, data);
  return data;

}

exports.account = {};

/*
* user.account.add()
* assign a user to an account
*/

exports.account.add = async function({ id, account, permission }){

  const data = await User.findOne({ id: id });

  if (data){

    data.account.push({ id: account, permission: permission, onboarded: false });
    data.markModified('account');
    return await data.save();

  }

  throw { message: `No user with that ID` };

}

/*
* user.delete()
* delete a user
*/


exports.delete = async function(id){

  return await User.findOneAndRemove({ id: id });

};
