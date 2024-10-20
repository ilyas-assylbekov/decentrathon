module.exports = (sequelize, DataTypes) => {
    const Candidate = sequelize.define('Candidate', {
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        position: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        status: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'На рассмотрении',
        },
        company: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        resume: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'Users', // Ensure this matches the table name
            key: 'id',
          },
        },
      });

      return Candidate;
};