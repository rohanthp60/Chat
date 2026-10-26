import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useAuthenticate } from "../../services/authService";
import styles from "./AuthForm.module.css";

const Register = () => {
    const fieldNames = ["firstName", "middleName", "lastName", "gender", "dateOfBirth", "userId", "password", "confirmPassword"];
    const [fieldValues, setFieldValues] = useState(fieldNames.reduce((acc, field) => ({ ...acc, [field]: "" }), {}));

    const [changed, setChanged] = useState(fieldNames.reduce((acc, field) => ({ ...acc, [field]: false }), {}));
    const navigate = useNavigate();
    const { goingOn, authenitcate } = useAuthenticate(true);

    const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const passwordsValid = fieldValues.password.length >= 8
        && fieldValues.password === fieldValues.confirmPassword;
    const errMessages = fieldNames.reduce((messages, field) => {
        if (field === "middleName" || !changed[field]) return messages;
        if (!fieldValues[field]) {
            messages[field] = `${capitalize(field)} is required.`;
        } else if (field === "password" && fieldValues.password.length < 8) {
            messages.password = "Password should be at least 8 characters long.";
        } else if (field === "confirmPassword" && fieldValues.confirmPassword !== fieldValues.password) {
            messages.confirmPassword = "Password and confirm password should match.";
        }
        return messages;
    }, {});
    const allFieldsProvided = fieldNames.filter(field => field !== "middleName").every(field => fieldValues[field]);
    

    const performRegister = async event => {
        event.preventDefault();
        if (!allFieldsProvided || !passwordsValid) {
            setChanged(fieldNames.reduce((fields, field) => ({ ...fields, [field]: true }), {}));
            return;
        }
        try {
            const result = await authenitcate(fieldValues);
            if (result?.success) {
                toast.success("Registered successfully. Please log in.");
                navigate("/auth/login", { replace: true });
            } else {
                toast.error(`${result?.message || "Some error occured."} Please try again.`);
            }
        } catch (error) {
            console.error("Registration failed:", error);
            toast.error("An error occurred while registering. Please try again.");
        }
    };

    const inputHandler = (fieldName) => {
        return event => {
            let finalValue = event.target.value;
            if (["firstName", "middleName", "lastName"].includes(fieldName)) {
                finalValue = capitalize(finalValue);
            }
            setFieldValues(prev => ({ ...prev, [fieldName]: finalValue }));
            setChanged(prev => ({ ...prev, [fieldName]: true }));
        };
    }
    const errorClass = fieldName => errMessages[fieldName] ? styles.errorField : "";

    return (
        <>
            <form onSubmit={performRegister}>
                <div className={styles.fields}>
                    <h1>Register</h1>
                    <div style={{ display: "flex", gap: "1rem", flexDirection: "row" }}>
                        <label htmlFor="firstName">First Name</label>
                        <input
                            className={`${styles.nameField} ${errorClass("firstName")}`}
                            name="firstName"
                            type="text"
                            value={fieldValues.firstName}
                            onChange={inputHandler("firstName")}
                        />
                        {errMessages.firstName && <span className={styles.errorMessage}>{errMessages.firstName}</span>}
                        <label htmlFor="middleName">Middle Name</label>
                        <input
                            className={styles.nameField}
                            name="middleName"
                            type="text"
                            value={fieldValues.middleName}
                            onChange={inputHandler("middleName")}
                        />
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            className={`${styles.nameField} ${errorClass("lastName")}`}
                            name="lastName"
                            type="text"
                            value={fieldValues.lastName}
                            onChange={inputHandler("lastName")}
                        />
                        {errMessages.lastName && <span className={styles.errorMessage}>{errMessages.lastName}</span>}
                    </div>


                    <label htmlFor="gender">Gender</label>
                    <select
                        className={`${styles.genderSelect} ${errorClass("gender")}`}
                        name="gender"
                        value={fieldValues.gender}
                        onChange={inputHandler("gender")}
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    {errMessages.gender && <span className={styles.errorMessage}>{errMessages.gender}</span>}

                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                        className={errorClass("dateOfBirth")}
                        name="dateOfBirth"
                        type="date"
                        value={fieldValues.dateOfBirth}
                        onChange={inputHandler("dateOfBirth")}
                    />
                    {errMessages.dateOfBirth && <span className={styles.errorMessage}>{errMessages.dateOfBirth}</span>}

                    <label htmlFor="userId">User ID</label>
                    <input
                        className={errorClass("userId")}
                        name="userId"
                        type="text"
                        value={fieldValues.userId}
                        onChange={inputHandler("userId")}
                    />
                    {errMessages.userId && <span className={styles.errorMessage}>{errMessages.userId}</span>}
                    <label htmlFor="password">Password</label>
                    <input
                        className={errorClass("password")}
                        name="password"
                        type="password"
                        value={fieldValues.password}
                        onChange={inputHandler("password")}
                    />
                    {errMessages.password && <span className={styles.errorMessage}>{errMessages.password}</span>}
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        className={errorClass("confirmPassword")}
                        name="confirmPassword"
                        type="password"
                        value={fieldValues.confirmPassword}
                        onChange={inputHandler("confirmPassword")}
                    />
                    {errMessages.confirmPassword && <span className={styles.errorMessage}>{errMessages.confirmPassword}</span>}
                    <div style={{display: 'flex', justifyContent: 'center'}}>
                        <button type="submit" disabled={goingOn} style={{width: "30%"}}>Register</button>
                    </div>
                </div>
            </form>
            <Link className={styles.link} to="../login">
                Already have an account? Log in
            </Link>
        </>
    );
};
export default Register;
