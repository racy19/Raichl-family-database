import React, { useState, useEffect } from 'react';

const FamilyMembersList = () => {
    const [familyMembers, setFamilyMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFamilyMembers = async () => {
            try {
                const response = await fetch('http://localhost:5000/clenove');
                if (!response.ok) {
                    throw new Error('Chyba při načítání členů');
                }
                const data = await response.json();
                setFamilyMembers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFamilyMembers();
    }, []);

    if (loading) {
        return <div>Načítání...</div>;
    }

    if (error) {
        return <div>Chyba: {error}</div>;
    }

    return (
        <div>
            <h2>Členové rodiny</h2>
            <ul>
                {familyMembers.length > 0 ? (
                    familyMembers.map((member) => (
                        <li key={member._id}>
                            <strong>{member.name} {member.surname}</strong><br />
                            {member.bio && <p>{member.bio}</p>}
                            {member.birthDate && <p>Datum narození: {new Date(member.birthDate).toLocaleDateString()}</p>}
                            {member.deathDate && <p>Datum úmrtí: {new Date(member.deathDate).toLocaleDateString()}</p>}
                        </li>
                    ))
                ) : (
                    <p>Žádní členové rodiny nebyli nalezeni.</p>
                )}
            </ul>
        </div>
    );
};

export default FamilyMembersList;