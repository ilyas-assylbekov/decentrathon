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
const axios = require('axios');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Enable CORS
app.use(bodyParser.json());

const sequelize = new Sequelize(process.env.DATABASE_URL, {dialect: 'postgres'});
const Job = JobModel(sequelize, DataTypes);

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

    const accessToken = jwt.sign({ email: user.email, role: user.role }, process.env.ACCESS_TOKEN_SECRET);
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
      const { title, description, requirements, workingConditions, salary, companyInfo, contactInfo } = req.body;
      const newJob = await Job.create({
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

  sequelize.sync({ force: false }).then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  });
