const express = require('express');
const bodyParer = require('body-parser');
const { appendFile } = require('fs-extra');
const path = require('path');
const ejs = require('ejs');
const { join } = require('path');
const mongoose = require('mongoose');
const { string } = require('joi');
const { remove } = require('lodash');

const rout = express();

rout.use(express.urlencoded({extended:true}));
rout.set('view engine','ejs');
rout.use(express.static(path.join(__dirname,'pubfolder')))


//mongo database creation and connection.
mongoose.set('strictQuery',true)
mongoose.connect('mongodb://127.0.0.1:27017/personlregistration');

    //creation of schema:
    const userSchema = new mongoose.Schema({
        id:String,
        name:String,
        age:Number,
        location:String,
        email:String,
        department:String
    })


    //user modul
    const User = mongoose.model('UserInfo',userSchema)



rout.get('/',(req,res)=>{

    // reding data from database.
    //searching in database if curently there is no data.
    User.find({},(err,foundList)=>{
        if(foundList.length === 0){
            res.render('index',{
                id: [],
                name: [],
                age: [],
                location: [],
                email: [],
                department: [],
                fid: '',
                fname: '',
                fage: '',
                flocation: '',
                femail: '',
                fdepartment: ''
            })
        }
        else{
            res.render('index',{
                id: foundList,
                name: foundList,
                age: foundList,
                location: foundList,
                email: foundList,
                department: foundList,
                fid: '',
                fname: '',
                fage: '',
                flocation: '',
                femail: '',
                fdepartment: ''
            })
        }
    })
    
})




//post user information
rout.post('/',(req,res)=>{
    const button = req.body.userinfo
    const userInf = req.body
    const update = req.body.update
    const delet = req.body.delete
    //incase submit button is clecked.
    if(button){
        const newUser = new User({
            id:req.body.id,
            name: req.body.name,
            location:req.body.location,
            age:req.body.age,
            email: req.body.email,
            department: req.body.department
        })
        //pushing inserted element into database
        User.findOne({id:req.body.id},(err,foundItem)=>{
            if(!err){
                if(foundItem){
                    //this is update. means the element is alredy created.
                    
                    User.findOneAndUpdate({id:req.body.id},{
                        id:req.body.id,
                        name: req.body.name,
                        age:req.body.age,
                        location:req.body.location,
                        email: req.body.email,
                        department: req.body.department
                    },null,(err,updated)=>{
                        if(!err){
                            if(updated){
                                console.log('updating proccess is successfully! thank you!')
                            }
                        }
                    })
                    res.redirect('/')
                }
                else{
                    //means the element is not allerdy created.
                    
                    newUser.save()
                    res.redirect('/')
                }
            }
        })
        
    }


    else if(update){
        User.findOne({id:update},(err,found)=>{
            if(!err){
                if(found){
                    User.find({},(err,foundList)=>{
                        if(!err){
                            if(foundList){

                                res.render('index',{
                                    id: foundList,
                                    name: foundList,
                                    age: foundList,
                                    location: foundList,
                                    email: foundList,
                                    department: foundList,
                                    fid: found.id,
                                    fname: found.name,
                                    fage: found.age,
                                    flocation: found.location,
                                    femail: found.email,
                                    fdepartment: found.department,
                                })
                            }
                        }
                    })
                    
                }

            }
        })

   }
   
   else if(delet){

    User.findOneAndRemove({id:delet},(err,removed)=>{
        if(!err){
            if(removed){
                console.log('your item is deleted successfully!')
            }
        }
    })
    res.redirect('/')
   }
})


module.exports = rout