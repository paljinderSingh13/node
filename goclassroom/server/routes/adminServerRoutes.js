Admin = require('../models/adminModel');

module.exports = (admin)=>{

	admin.post('/admin/login', (req, res)=>{

		Admin.login(req.body, (result)=>{
			res.send(result);
		})
		
	})

	admin.get('/admin/getAllGroups', (req, res)=>{

		Admin.allGroups(req, (result)=>{
			res.send(result);
		})

	})

	admin.get('/admin/getAllInst', (req, res)=>{

		Admin.allInst(req, (result)=>{
			res.send(result);
		})

	})

	admin.put('/admin/approveInstitute', (req, res)=>{

		Admin.approveInstitute(req.body, (result)=>{
			res.send(result);
		})

	})

	admin.get('*', (req, res)=>{
		res.sendFile('index.html', {root : './src/admin'});
	})

}