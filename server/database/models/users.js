const orm = (Datatypes, Model, sequelize) => {
    class Users extends Model {};
    Users.init(
        {
            uid: {
                type: Datatypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            userId: {
                type: Datatypes.STRING(100),
                unique: true
            },
            firstName: {
                type: Datatypes.STRING(100)
            },
            middleName: {
                type: Datatypes.STRING(100)
            },
            lastName: {
                type: Datatypes.STRING(100)
            },
            gender: {
                type: Datatypes.ENUM("male", "female", "other")
            },
            dateOfBirth: {
                type: Datatypes.DATEONLY
            },
            passwordHash: {
                type: Datatypes.STRING(100)
            }
        }, 
        {
            sequelize,
            modelName: "Users",
            tableName: "Users",
            timestamps: false
        }
    );
    return Users;
}

module.exports = orm;