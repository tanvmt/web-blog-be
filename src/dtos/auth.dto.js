class UserDTO {
    constructor({ id, name, email, role, isVerified }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    static fromEntity(entity) {
        return new UserDTO(entity);
    }
}

module.exports = UserDTO;