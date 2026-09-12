const orm = (Datatypes, Model, sequelize) => {
    class Users extends Model {};
    Users.init(
        {
            uid: {
                type: Datatypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
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
            joinedSince: {
                type: Datatypes.DATEONLY
            },
            leftSince: {
                type: Datatypes.DATEONLY
            },
            role: {
                type: Datatypes.ENUM("admin", "student", "teacher")
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