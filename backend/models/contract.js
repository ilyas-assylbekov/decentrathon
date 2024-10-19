module.exports = (sequelize, DataTypes) => {
    const Contract = sequelize.define('Contract', {
        candidateId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'Candidates', // Name of the table
              key: 'id',
            },
          },
          status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Ожидает подписания',
          },
          employerSigned: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          employeeSigned: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          contractFile: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          employeeAddress: { // Add this attribute
            type: DataTypes.STRING,
            allowNull: false,
          },
      });

      return Contract;
};