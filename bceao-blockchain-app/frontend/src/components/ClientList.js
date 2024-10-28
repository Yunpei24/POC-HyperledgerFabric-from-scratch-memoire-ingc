import React, { useEffect, useState } from "react";

const ClientList = () => {
    const [clients, setClients] = useState([]);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/clients");
            const data = await response.json();
            if (data.success) {
                setClients(data.data);
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    return (
        <div>
            <h2>Liste des Clients</h2>
            <ul>
                {clients.map((client) => (
                    <li key={client.ubi}>{client.firstName} {client.lastName}</li>
                ))}
            </ul>
        </div>
    );
};

export default ClientList;
