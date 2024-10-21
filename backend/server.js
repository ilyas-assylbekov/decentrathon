require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('./models');
const authenticateToken = require('./middleware/authenticateToken');
const { Sequelize, DataTypes } = require('sequelize');
const JobModel = require('./models/Job'); // Adjust the path as necessary
const CandidateModel = require('./models/candidate');
const ContractModel = require('./models/contract');
const axios = require('axios');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);
const multer = require('multer');
const path = require('path');
const Web3 = require('web3');
const TruffleContract = require('@truffle/contract');
const fs = require('fs');
//const telegramBot = require('./telegramBot'); // Include the Telegram bot

const web3 = new Web3('http://localhost:8545'); // Connect to Ganache
const EmploymentContractJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../build/contracts/EmploymentContract.json')));
const EmploymentContract = TruffleContract(EmploymentContractJSON);
EmploymentContract.setProvider(web3.currentProvider);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Enable CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from the uploads directory

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const sequelize = new Sequelize(process.env.DATABASE_URL, {dialect: 'postgres'});
const Job = JobModel(sequelize, DataTypes);
const Candidate = CandidateModel(sequelize, DataTypes);
const Contract = ContractModel(sequelize, DataTypes);

app.post('/register', async (req, res) => {
  const { role, email, password, name, field } = req.body;

  try {
    const user = await User.create({ role, email, password, name, field });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error('Invalid email');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error('Invalid password');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = jwt.sign({ email: user.email, role: user.role, name: user.name, id: user.id }, process.env.ACCESS_TOKEN_SECRET);
    res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: error.message });
  }
});

// Updated endpoint to get company data
app.get('/company', authenticateToken, async (req, res) => {
  try {
    const company = await User.findOne({ where: { email: req.user.email } });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.status(200).json(company);
  } catch (error) {
    console.error('Error fetching company data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Updated endpoint to get worker data
app.get('/worker', authenticateToken, async (req, res) => {
    try {
      const worker = await User.findOne({ where: { email: req.user.email } });
      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      res.status(200).json(worker);
    } catch (error) {
      console.error('Error fetching worker data:', error);
      res.status(500).json({ error: error.message });
    }
  });

app.post('/jobs', async (req, res) => {
    try {
      const { name, title, description, requirements, workingConditions, salary, companyInfo, contactInfo } = req.body;
      console.log('Creating job from:', name);
      const newJob = await Job.create({
        company: name,
        title,
        description,
        requirements,
        workingConditions,
        salary,
        companyInfo,
        contactInfo,
      });
      res.status(201).json(newJob);
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/search', async (req, res) => {
    const { searchTerm } = req.body;
    console.log('Searching for jobs:', searchTerm);
  
    try {
      // Call the Python script to process the search term using LLaMA
      const { stdout, stderr } = await execAsync(`python llama_inference.py "${searchTerm}"`);
      
      if (stderr) {
        console.error(`Python script stderr: ${stderr}`);
        return res.status(500).json({ error: stderr });
      }
  
      console.log(`Python script stdout: ${stdout}`);
      const processedQuery = stdout.trim();
  
      // Fetch matching jobs from the database
      const jobs = await Job.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: `%${processedQuery}%` } },
            { description: { [Op.iLike]: `%${processedQuery}%` } },
            { requirements: { [Op.iLike]: `%${processedQuery}%` } },
          ],
        },
      });
  
      res.json(jobs);
    } catch (error) {
      console.error(`Error executing Python script: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/all-postings', async (req, res) => {
    try {
      const jobs = await Job.findAll();
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/apply', upload.single('resume'), async (req, res) => {
    try {
      const { name, position, company, userId } = req.body;
      const resume = req.file ? path.join("uploads", req.file.filename) : null;
      console.log('Applying for job:', position, 'at', company, 'with resume:', resume, 'for user:', userId);
      const newCandidate = await Candidate.create({ name, position, company, resume, status: 'На рассмотрении', userId: userId });
      res.status(201).json(newCandidate);
    } catch (error) {
      console.error('Error applying for job:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/candidates', async (req, res) => {
    try {
      const { name } = req.query;
      if (!name) {
        return res.status(400).json({ error: 'Company is required' });
      }
  
      const candidates = await Candidate.findAll({
        where: {
          company: name,
        },
      });
      res.json(candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/candidates', async (req, res) => {
    try {
      const { status } = req.body;
      if (status !== 'Отклонено') {
        return res.status(400).json({ error: 'Invalid status' });
      }
  
      const declinedCandidates = await Candidate.findAll({
        where: {
          status,
        },
      });
  
      if (declinedCandidates.length === 0) {
        return res.status(404).json({ message: 'No declined candidates found' });
      }
  
      await Candidate.destroy({
        where: {
          status,
        },
      });
  
      res.status(200).json({ message: 'Declined candidates removed' });
    } catch (error) {
      console.error('Error removing candidates:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/candidates/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      const candidate = await Candidate.findByPk(id);
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
  
      candidate.status = status;
      await candidate.save();
  
      res.status(200).json(candidate);
    } catch (error) {
      console.error('Error updating candidate status:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/contracts', upload.single('contractFile'), async (req, res) => {
    try {
      console.log(req.body);
      const { candidateId, employeeAddress } = req.body;
      console.log('Creating contract for candidate:', candidateId);
      const contractFile = req.file ? path.join("uploads",req.file.filename) : null;
      const contract = await Contract.create({ candidateId: candidateId, employeeAddress, contractFile, status: 'Ожидает подписания' });
      res.status(201).json(contract);
    } catch (error) {
      console.error('Error creating contract:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post('/contracts/:id/sign', async (req, res) => {
    try {
      const { id } = req.params;
      const {role} = req.body;
      console.log('Signing contract:', id, 'as', role);
      const contract = await Contract.findByPk(id);
      console.log(contract);
      if (!contract) {
        return res.status(404).json({ error: 'Contract not found' });
      }
  
      if (role === 'Компания') {
        contract.employerSigned = true;
      } else if (role === 'Рабочий') {
        contract.employeeSigned = true;
      }
  
      if (contract.employerSigned && contract.employeeSigned) {
        contract.status = 'Подписан';

        const accounts = await web3.eth.getAccounts();
        const deployedContract = await EmploymentContract.new({
          from: accounts[0],
          gas: 1500000,
          gasPrice: '30000000000',
        });

        // Set the employee address and contract file
        await deployedContract.setEmployee(contract.employeeAddress, contract.contractFile, {
          from: accounts[0],
        });

        console.log('Contract deployed at address:', deployedContract.address);
        contract.blockchainAddress = deployedContract.address; // Save the blockchain address

      }
      await contract.save();
  
      // Here you would also handle the blockchain interaction to create the smart contract
      // Deploy the contract to the blockchain
      

      res.status(200).json(contract);
    } catch (error) {
      console.error('Error signing contract:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/worker/:userId/contracts', async (req, res) => {
    try {
      const { userId } = req.params;
      
      const candidate = await Candidate.findAll({ where: { userId: userId } });
      console.log('Candidate:', candidate);
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
  
      let contracts = [];
      for (const candidate of candidates) {
        const candidateContracts = await Contract.findAll({
          where: {
            candidateId: candidate.id,
          },
        });
        contracts = contracts.concat(candidateContracts);
      }

      res.json(contracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/worker/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      //console.log('Fetching contracts for worker:', userId);
      const candidate = await Candidate.findOne({ where: { userId: userId } });
      const worker = await User.findByPk(userId);
      //console.log('Candidate:', candidate, 'Worker:', worker);
      if (!candidate && !worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      
      let contracts = [];
      if (candidate) {
        contracts = await Contract.findAll({
          where: {
            candidateId: candidate.id,
          },
        });
      }
  
      const workerData = {
        ...worker.toJSON(),
        contracts,
      };

      console.log('Worker data:', workerData);
  
      res.json(workerData);
    } catch (error) {
      console.error('Error fetching worker data:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // app.post('/contracts/:id/sign', async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const { role } = req.body;
  //     const contract = await Contract.findByPk(id);
  //     if (!contract) {
  //       return res.status(404).json({ error: 'Contract not found' });
  //     }
  
  //     if (role === 'Рабочий') {
  //       contract.employeeSigned = true;
  //     } else if (role === 'Компания') {
  //       contract.employerSigned = true;
  //     }
  
  //     if (contract.employeeSigned && contract.employerSigned) {
  //       contract.status = 'Подписан';
  //     }
  
  //     await contract.save();
  
  //     res.status(200).json(contract);
  //   } catch (error) {
  //     console.error('Error signing contract:', error);
  //     res.status(500).json({ error: error.message });
  //   }
  // });

  sequelize.sync({ force: false }).then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  });
