module.exports = (sequelize, DataTypes) => {
    const Job = sequelize.define('Job', {
      company: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      requirements: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      workingConditions: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      salary: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      companyInfo: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      contactInfo: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    });
  
    return Job;
  };