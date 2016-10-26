var fs = require('fs');
console.log('start...');
var http = require('http');
var url = require('url');
if(!fs.existsSync('data')){
	fs.mkdirSync('data');	// 存放数据的目录
}

http.createServer(function(req,res){
	var body = '';
	req.on('data', (data)=>{
		console.log(data);
		body += data;
	});
	req.on('end', ()=>{
		console.log('body end');
		var reqData = {};
		try{
			reqData = JSON.parse(body);
		}catch(e){
			
		}
		console.log(reqData);
		var ou = url.parse(req.url,true,false);
		var au = ou.pathname.split('/');
		if(au.length<2||au[1]!='ajax'){
			// 文件直接访问，存放在web目录中
			fs.readFile('web/'+ou.pathname, function(err,data){
				if(err){
					// 访问失败，应该是访问了不存在的文件，重定向到index.html
					console.log(ou.pathname);
					console.log(JSON.stringify(err));
					res.setHeader('Location','/index.html');
					res.writeHead(301);
					res.end();
					return;
	//				res.writeHead(404);
	//				res.end('<h1>404</h1>File Not Found.');
	//				return;
				}
				// 写文件内容到response
				res.writeHead(200);
				res.end(data);
			});
		}else{
			console.log(ou.pathname.substr(6));
			console.log(ou.search.substr(1));
			console.log(ou.query);
			var cmd = ou.pathname.substr(6);
			var para = ou.search.substr(1);
			var ret;
			// cmd是请求的命令，para是请求的参数
			// 处理完后将结果放在ret中（json格式）
			
			switch(cmd){
				case 'login':
					// 登陆
					res.writeHead(200);
					ret = {err:0,msg:"ok"};
					break;
				case 'list':
					// 列出已存储的密码
					break;
				case 'get':
					if(!reqData.pass){
						ret = {err:-2,msg:"para err"};
						break;
					}
					var filename = 'data/'+reqData.pass+'.dat';
					var data='';
					try{
						data = fs.readFileSync(filename, 'utf8');
					}catch(e){}
					ret = {err:0,msg:"ok get",data:data};
					break;
				case 'set':
					if(!reqData.pass || !reqData.data){
						ret = {err:-2,msg:"para err"};
						break;
					}
					var filename = 'data/'+reqData.pass+'.dat';
					var data=reqData.data;
					try{
						fs.writeFileSync(filename, data, 'utf8');
						ret = {err:0,msg:"ok set"};
					}catch(e){
						ret = {err:-3,msg:"write file err"};
					}
					break;
				default:
					ret = {err:-1,msg:"unkonwn cmd"};
					break;
			}
			res.writeHead(200);
			res.end(JSON.stringify(ret));
		}
	});
}).listen(6006);
