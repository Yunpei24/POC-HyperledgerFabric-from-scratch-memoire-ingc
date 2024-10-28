import React, { useState } from "react";

const ClientForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        ubi: "",
        firstName: "",
        lastName: "",
        email: ""
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="UBI"
                value={formData.ubi}
                onChange={(e) => setFormData({...formData, ubi: e.target.value})}
            />
            <button type="submit">Soumettre</button>
        </form>
    );
};

export default ClientForm;
