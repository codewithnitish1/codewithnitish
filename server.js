import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import Razorpay from 'razorpay';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dataDir = path.join(__dirname, 'data');
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(dataDir, {recursive:true}); fs.mkdirSync(uploadDir,{recursive:true});
const dbFile=path.join(dataDir,'store.json');
const db=()=>JSON.parse(fs.readFileSync(dbFile,'utf8'));
const save=x=>fs.writeFileSync(dbFile,JSON.stringify(x,null,2));
if(!fs.existsSync(dbFile)) save({users:[],products:[
 {id:'p1',name:'UPBoardSolutions Starter',category:'Education',description:'Responsive education portal starter.',price:50,demo:'https://upboardssolutions.com',file:''},
 {id:'p2',name:'School ERP Starter UI',category:'School',description:'Premium responsive school management starter.',price:50,demo:'',file:''}
],orders:[],purchases:[]});

const app=express();
app.use(cors({origin:true,credentials:true}));
app.use(express.json({limit:'2mb'}));
app.use('/assets',express.static(root));
const razorpay=new Razorpay({key_id:process.env.RAZORPAY_KEY_ID||'',key_secret:process.env.RAZORPAY_KEY_SECRET||''});

function token(u){return jwt.sign({id:u.id,email:u.email,role:u.role},process.env.JWT_SECRET||'dev-secret',{expiresIn:'30d'});}
function auth(req,res,next){try{const h=req.headers.authorization||'';req.user=jwt.verify(h.replace(/^Bearer /,''),process.env.JWT_SECRET||'dev-secret');next();}catch{res.status(401).json({error:'Login required'});}}
function admin(req,res,next){if(req.user?.role!=='admin') return res.status(403).json({error:'Admin only'}); next();}

const upload=multer({storage:multer.diskStorage({destination:uploadDir,filename:(req,file,cb)=>cb(null,crypto.randomUUID()+path.extname(file.originalname))}),limits:{fileSize:100*1024*1024}});

app.get('/api/config',(req,res)=>res.json({razorpayKeyId:process.env.RAZORPAY_KEY_ID||''}));
app.post('/api/auth/register',async(req,res)=>{const {name,email,password}=req.body||{};if(!name||!email||!password||password.length<6)return res.status(400).json({error:'Name, email and 6+ character password required'});const d=db();if(d.users.some(x=>x.email.toLowerCase()===email.toLowerCase()))return res.status(409).json({error:'Account already exists'});const u={id:crypto.randomUUID(),name,email:email.toLowerCase(),password:await bcrypt.hash(password,12),role:'buyer'};d.users.push(u);save(d);res.json({token:token(u),user:{id:u.id,name:u.name,email:u.email,role:u.role}})});
app.post('/api/auth/login',async(req,res)=>{const {email,password}=req.body||{};const d=db();let u=d.users.find(x=>x.email===String(email||'').toLowerCase());if(!u&&email===process.env.ADMIN_EMAIL&&password===process.env.ADMIN_PASSWORD){u={id:'admin',name:'Admin',email:process.env.ADMIN_EMAIL,role:'admin'};}if(!u|| (u.password && !(await bcrypt.compare(password,u.password)))) return res.status(401).json({error:'Invalid email or password'});res.json({token:token(u),user:{id:u.id,name:u.name,email:u.email,role:u.role}})});

app.get('/api/products',(req,res)=>res.json(db().products));
app.post('/api/products',auth,admin,upload.single('file'),(req,res)=>{const d=db();const p={id:crypto.randomUUID(),name:req.body.name,category:req.body.category||'Digital Product',description:req.body.description||'',price:50,demo:req.body.demo||'',file:req.file?.filename||''};if(!p.name||!p.file)return res.status(400).json({error:'Project name and source ZIP are required'});d.products.push(p);save(d);res.json(p)});
app.delete('/api/products/:id',auth,admin,(req,res)=>{const d=db();d.products=d.products.filter(p=>p.id!==req.params.id);save(d);res.json({ok:true})});

app.post('/api/payments/order',auth,async(req,res)=>{const p=db().products.find(x=>x.id===req.body.productId);if(!p)return res.status(404).json({error:'Project not found'});if(!process.env.RAZORPAY_KEY_ID||!process.env.RAZORPAY_KEY_SECRET)return res.status(503).json({error:'Razorpay keys are not configured'});const order=await razorpay.orders.create({amount:5000,currency:'INR',receipt:'cn_'+Date.now(),notes:{productId:p.id,buyerId:req.user.id}});const d=db();d.orders.push({id:order.id,buyerId:req.user.id,productId:p.id,amount:5000,status:'created',createdAt:new Date().toISOString()});save(d);res.json({orderId:order.id,amount:5000,currency:'INR',keyId:process.env.RAZORPAY_KEY_ID,product:p.name})});
app.post('/api/payments/verify',auth,(req,res)=>{const {razorpay_order_id,razorpay_payment_id,razorpay_signature,productId}=req.body;const body=razorpay_order_id+'|'+razorpay_payment_id;const expected=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET||'').update(body).digest('hex');if(!crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(razorpay_signature||'')))return res.status(400).json({error:'Payment verification failed'});const d=db();const o=d.orders.find(x=>x.id===razorpay_order_id);if(!o||o.buyerId!==req.user.id||o.productId!==productId)return res.status(400).json({error:'Order mismatch'});o.status='paid';o.paymentId=razorpay_payment_id;o.paidAt=new Date().toISOString();if(!d.purchases.some(x=>x.buyerId===req.user.id&&x.productId===productId))d.purchases.push({id:crypto.randomUUID(),buyerId:req.user.id,productId,paymentId:razorpay_payment_id,orderId:razorpay_order_id,amount:5000,paidAt:o.paidAt,lifetime:true});save(d);res.json({ok:true,message:'Lifetime access granted'})});
app.post('/api/webhooks/razorpay',(req,res)=>{const signature=req.headers['x-razorpay-signature'];const raw=JSON.stringify(req.body);const expected=crypto.createHmac('sha256',process.env.RAZORPAY_WEBHOOK_SECRET||'').update(raw).digest('hex');if(process.env.RAZORPAY_WEBHOOK_SECRET&&signature!==expected)return res.status(400).send('bad signature');res.json({ok:true})});
app.get('/api/me/purchases',auth,(req,res)=>{const d=db();res.json(d.purchases.filter(x=>x.buyerId===req.user.id).map(x=>({...x,product:d.products.find(p=>p.id===x.productId)})))});
app.get('/api/admin/payments',auth,admin,(req,res)=>{const d=db();res.json(d.purchases.map(x=>({...x,buyer:d.users.find(u=>u.id===x.buyerId)?.email||x.buyerId,product:d.products.find(p=>p.id===x.productId)?.name||x.productId})))});
app.get('/api/download/:productId',auth,(req,res)=>{const d=db();const p=d.products.find(x=>x.id===req.params.productId);const ok=req.user.role==='admin'||d.purchases.some(x=>x.buyerId===req.user.id&&x.productId===p?.id&&x.lifetime);if(!p||!ok||!p.file)return res.status(404).json({error:'Download unavailable'});res.download(path.join(uploadDir,p.file),p.name.replace(/[^a-z0-9-_]+/gi,'_')+'.zip')});
app.get('*',(req,res)=>res.sendFile(path.join(root,'index.html')));
app.listen(process.env.PORT||3000,()=>console.log('CodeWithNitish Store v2 running'));
