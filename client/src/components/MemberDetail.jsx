import { useEffect, useState } from "react";
import { Link, useParams } from 'react-router-dom';
import { apiGet, apiDelete } from "../utils/api";
import Button from "./form-parts/Button";

const MemberDetail = () => {
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [children, setChildren] = useState([]);
    const [mother, setMother] = useState(null);
    const [father, setFather] = useState(null);
    const [partner, setPartner] = useState(null);
    const [siblings, setSiblings] = useState([]);

    useEffect(() => {
        apiGet(`/clenove/${id}`)
            .then(data => {
                setMember(data.familyMember);
                setChildren(data.children);
                setMother(data.mother);
                setFather(data.father);
                setPartner(data.partner);
                setSiblings(data.siblings);
            })
            .catch((error) => console.error(error));
    }, [id]);

    if (!member) {
        return <div>Načítání...</div>;
    }

    return (
        <div className="container">
            <div className="card p-3 mb-2 d-block" style={{ width: "fit-content" }}>
                <h2>{member.name} {member.surname}</h2>
                {member.maidenName && <p>Rodné příjmení: {member.maidenName}</p>}
                {member.birthDate && <p>Datum narození: {new Date(member.birthDate).toLocaleDateString()}</p>}
                {member.deathDate && <p>Datum úmrtí: {new Date(member.deathDate).toLocaleDateString()}</p>}
                {partner && <p>Partner: {<Link to={`/clenove/${partner._id}`}>{partner.name} {partner.surname} {partner.birthDate && `*${new Date(partner.birthDate).getFullYear()}`}</Link>}</p>}
                {mother && <p>Matka: {<Link to={`/clenove/${mother._id}`}>{mother.name} {mother.surname} {mother.birthDate && `*${new Date(mother.birthDate).getFullYear()}`}</Link>}</p>}
                {father && <p>Otec: {<Link to={`/clenove/${father._id}`}>{father.name} {father.surname} {father.birthDate && `*${new Date(father.birthDate).getFullYear()}`}</Link>}</p>}
                {siblings && siblings.length > 0 && (
                    <div>
                        Sourozenci:
                        <ul>
                            {siblings.map(sibling => (
                                <li key={sibling._id}>
                                    <Link to={`/clenove/${sibling._id}`}>
                                        {sibling.name} {sibling.surname} {sibling.birthDate && `*${new Date(sibling.birthDate).getFullYear()}`}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {children && children.length > 0 && (
                    <div>
                        Děti:
                        <ul>
                            {children.map(child => (
                                <li key={child._id}>
                                    <Link to={`/clenove/${child._id}`}>
                                        {child.name} {child.surname} {child.birthDate && `*${new Date(child.birthDate).getFullYear()}`}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {member.bio && <p>Biografie: {member.bio}</p>}
                <Link to={`/form/${member._id}`} className="btn btn-sm btn-outline-warning me-1">Upravit záznam</Link>
                <Button label="Odstranit záznam"
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
                    type="button"></Button>
            </div>
            <Link to="/clenove" className="btn btn-sm btn-outline-success">Zpět na seznam členů rodiny</Link>
        </div>
    );
}

export default MemberDetail;