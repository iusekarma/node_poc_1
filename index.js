const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const sequelize = new Sequelize('database_development', process.env.MYSQL_USER, process.env.MYSQL_USER, {
    dialect: 'mysql',
    host: 'localhost',
});

const Company = sequelize.define('Company', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    site: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});

app.get('/unsent-companies', async (req, res) => {
    try {
        const unsentCompanies = await Company.findAll({
            where: {
                sent: true,
            },
            attributes: ['id', 'email'],
            limit: 2,
        });
        unsentCompanies.forEach(async (company) => {
            company.sent = true;
            await company.save();
        });
        res.json(unsentCompanies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/verify-company/:id', async (req, res) => {
    const companyId = req.params.id;
    try {
        const company = await Company.findByPk(companyId);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        company.verified = true;
        await company.save();
        res.json({ message: 'Company email verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // console.log(process.env);
});
