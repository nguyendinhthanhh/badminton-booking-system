import { LoginInput } from "./LoginInput";

export const RegisterForm = ({ formData, handleInputChange }) => {
    return (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <LoginInput
                label="Full Name"
                icon="badge"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
            />
            <LoginInput
                label="Username"
                icon="person"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
            />
            <LoginInput
                label="Email Address"
                icon="mail"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
            />
            <LoginInput
                label="Phone Number"
                icon="call"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            />
            <LoginInput
                label="Password"
                icon="lock"
                type="password"
                placeholder="Create a password"
                isPassword
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
            />
        </div>
    );
};