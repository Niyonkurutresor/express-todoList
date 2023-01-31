const express = require('express');
const bodyParser = require('body-parser');
const { appendFile } = require('fs-extra');
const ejs = require('ejs')
const path = require('path');
const { join } = require('path');
const mongoose = require('mongoose');
const app = express();

app.set('view engine','ejs')
app.use(express.static(path.join(__dirname,'publics')))
app.use(bodyParser.urlencoded({extended:true}))


//database creation
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/todoListDB')


//schema one 
const itemSchema = new mongoose.Schema({
    name:String
})
const Item = mongoose.model('Item',itemSchema);
//end of schema one

//schema two
const litsSchema = new mongoose.Schema({
    listTitle:String,
    listElement:[itemSchema]
})
const List = mongoose.model('List',litsSchema);
//end of schema

//items
const item1 = new Item({
    name:'well come to this todolist'
})
const item2 = new Item({
    name:'this is how it works'
})
const item3 = new Item({
    name:'my list is essential'
})

const defaultItes = [item1,item2,item3]




//home rout 
app.get('/',(req,res)=>{

    Item.find({},(err,result)=>{
        //in case our database is empty
        if(result.length== 0){
           //inserting default items in database
            Item.insertMany(defaultItes,(err,found)=>{
                if(err){
                    console.log(err)
                }else{
                    console.log('data are inserted in todolist DB successfully!')
                }
                res.redirect('/')
            }) 
        }
        else{
            //if our database constains some info.
            // we have to render out information
            res.render('template',{
                listTitle: 'home',
                items:result
            })
        }
        
    })
    

})


// ading item on the list
app.post('/',(req,res)=>{
    const listName = req.body.list
    const newitem = req.body.newItem;

    const newItem = new Item({
        name : newitem
    })

    if(listName == 'home'){
        newItem.save()
        res.redirect('/')
    }
    else{
        List.findOne({listTitle:listName},(err,found)=>{
            if(err){
                console.log(err)
            }
            else{
                found.listElement.push(newItem)
                found.save()
                res.redirect('/'+listName)
            }
        })
    }
    
})


// deleting items of the list
app.post('/deletItem',(req,res)=>{

    const itemId = req.body.checkbox
    const listName = req.body.listName
    if(listName == 'home'){
        Item.findByIdAndRemove(itemId,(err)=>{
            if(!err){
                console.log('Item deleted successfuly!')
                 res.redirect('/')
            }else{   
                console.log(err)  
            }
            
        })
    }
    else{
        List.findOneAndUpdate({listTitle:listName},{$pull:{listElement: {_id:itemId}}},(err,found)=>{
            if(!err){
                res.redirect('/'+listName)
            }
        })
    }
    
    })
    
    

//accesing different list 
app.get('/:list',(req,res)=>{
    
    const list = req.params.list
    List.findOne({listTitle:list},(erro,foud)=>{
        if(erro){
            console.log(erro)
        }
        else{
            if(foud){
                //list is alredy exist
                res.render('template',{
                    listTitle:list,
                    items:foud.listElement

                })
            }
            else{
                //list it does not exist we have to create it
                // it will start with defoult items
                 const item = new List({
                        listTitle:list,
                        listElement: defaultItes
                    })
                    item.save()
                    res.redirect('/'+list)
            }
        }
    })
    
})


// port our application will listen on.
let port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`server is runnint on port ${port}`)
})