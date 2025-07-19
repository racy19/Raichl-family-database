import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiDelete } from '../utils/api';
import Button from './form-parts/Button';

const FamilyMembersList = () => {
    const [familyMembers, setFamilyMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFamilyMembers = async () => {
            try {
                const response = await fetch('https://raichl-family-database.onrender.com/clenove');
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

    const sortedMembers = [...familyMembers].sort((a, b) => {
        if (!a.birthDate && b.birthDate) return 1;
        if (a.birthDate && !b.birthDate) return -1;
        const dateA = new Date(a.birthDate);
        const dateB = new Date(b.birthDate);
        return dateA - dateB;
    });

    if (loading) {
        return <div>Načítání...</div>;
    }

    if (error) {
        return <div>Chyba: {error}</div>;
    }

    return (
        <>
            <div className='container'>
                <h2>Členové rodiny</h2>
                <Link to="/form" className="btn btn-sm btn-outline-primary mb-3" >Přidat člena rodiny</Link>
                <ul>
                    {sortedMembers.length > 0 ? (
                        sortedMembers.map((member) => (
                            <li key={member._id} className='row mb-2'>
                                <Link to={`/clenove/${member._id}`} className='col-12 col-md-8 col-lg-6'>
                                    <strong>{member.name} {member.surname} </strong>
                                    {member.birthDate && <span>*{new Date(member.birthDate).toLocaleDateString()}</span>}
                                    {member.deathDate && <span> - +{new Date(member.deathDate).toLocaleDateString()}</span>}
                                </Link>

                                <span className="btn-group col-4 col-md-4 col-lg-4">
                                    <Link
                                        to={"/clenove/" + member._id}
                                        className="btn btn-sm btn-outline-success"
                                    >
                                        Zobrazit
                                    </Link>
                                    <Link
                                        to={"/form/" + member._id}
                                        className="btn btn-sm btn-outline-warning"
                                    >
                                        Upravit
                                    </Link>
                                    <Button label="Odstranit"
                                        onClick={async () => {
                                            if (window.confirm("Opravdu chcete odstranit tohoto člena rodiny?")) {
                                                try {
                                                    await apiDelete("/clenove/" + member._id);
                                                    alert("Člen byl úspěšně smazán.");
                                                } catch (error) {
                                                    console.error("Chyba při odstraňování člena:", error);
                                                }
                                            }
                                        }}
                                        className="btn btn-sm btn-outline-danger"
                                        type="button"
                                    />
                                </span>
                            </li>
                        ))
                    ) : (
                        <p>Žádní členové rodiny nebyli nalezeni.</p>
                    )}
                </ul>
            </div>
        </>
    );
};

export default FamilyMembersList;