const orm = (Datatypes, Model, sequelize) => {
    class Chats extends Model {};
    Chats.init(
        {
            id: {
                type: Datatypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            chatId: {
                type: Datatypes.STRING(100),
                unique: true,
                allowNull: false
            },
            conversation: {
                type: Datatypes.JSONB
            },
            groupChat: {
                type: Datatypes.BOOLEAN,
                defaultValue: false
            },
            name: {
                type: Datatypes.STRING(100),
            }
        },
        {
            sequelize,
            modelName: "Chats",
            tableName: "Chats",
            timestamps: false
        }
    );

    return Chats;
}

module.exports = orm;
