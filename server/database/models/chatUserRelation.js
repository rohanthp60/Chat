const orm = (Datatypes, Model, sequelize) => {
    class ChatUserRelation extends Model {};
    ChatUserRelation.init(
        {
            userId: {
                type: Datatypes.STRING(100),
                references: {
                    model: "Users",
                    key: "userId"
                }
            },
            chatId: {
                type: Datatypes.STRING(100),
                references: {
                    model: "Chats",
                    key: "chatId"
                }
            }
        },
        {
            sequelize,
            modelName: "ChatUserRelation",
            tableName: "ChatUserRelation",
            timestamps: false
        }
    );

    return ChatUserRelation;
}

module.exports = orm;
