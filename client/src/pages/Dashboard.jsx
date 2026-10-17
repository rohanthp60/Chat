import { useQuery } from "@tanstack/react-query";

import getContacts from "../services/contactService";
import { useAuth } from "../contexts/AuthContext";
import LogOutButton from "../components/LogOutButton";


export const Dashboard = () => {
    const { token } = useAuth();
    const { data: contacts, isLoading, error } = useQuery({
        queryKey: ["contacts"],
        queryFn: () => getContacts(token),
    });

    return (
        <>
            <h1>Contacts</h1>
            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {contacts && (
                <ul>
                    {contacts.map((contact) => (
                        <li key={contact.userId}>{contact.userId}</li>
                    ))}
                </ul>
            )}
            <LogOutButton />
        </>
    )
}