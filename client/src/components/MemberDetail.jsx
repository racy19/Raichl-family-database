import { useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom';
import { apiGet } from "../utils/api";


const MemberDetail = () => {
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [children, setChildren] = useState([]);

    useEffect(() => {
        apiGet(`/clenove/${id}`)
            .then(data => {
                setMember(data.familyMember);
                setChildren(data.children);
            })
            .catch((error) => console.error(error));
    }, [id]);

    console.log(children);

    if (!member) {
        return <div>Načítání...</div>;
    }

    return (
        <div>
            <h2>{member.name} {member.surname}</h2>
            {member.maidenName && <p>Rodné příjmení: {member.maidenName}</p>}
            {member.birthDate && <p>Datum narození: {new Date(member.birthDate).toLocaleDateString()}</p>}
            {member.deathDate && <p>Datum úmrtí: {new Date(member.deathDate).toLocaleDateString()}</p>}
            {children && children.length > 0 && (
                <div>
                    Děti:
                    <ul>
                        {children.map(child => (
                            <Link to={`/clenove/${child._id}`}>
                                <li key={child._id}>{child.name} {child.surname}</li>
                            </Link>
                        ))}
                    </ul>
                </div>
            )}
            {member.bio && <p>{member.bio}</p>}
            <Link to="/clenove">Zpět na seznam členů rodiny</Link>
        </div>
    );
}

export default MemberDetail;