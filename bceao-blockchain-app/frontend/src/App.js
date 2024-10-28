import React from "react";
import ClientForm from "./components/ClientForm";
import ClientList from "./components/ClientList";

function App() {
    const handleSubmit = async (formData) => {
        try {
            const response = await fetch("http://localhost:3000/api/clients", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div>
            <h1>BCEAO Blockchain App</h1>
            <ClientForm onSubmit={handleSubmit} />
            <ClientList />
        </div>
    );
};

export default App;
