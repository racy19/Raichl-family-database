import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGet, apiPost, apiPut } from '../utils/api';
import InputField from './form-parts/InputField';
import TextArea from './form-parts/TextArea';
import InputSelect from './form-parts/InputSelect';
import RadioButton from './form-parts/RadioButton';
import Button from './form-parts/Button';
import FlashMessage from './form-parts/FlashMessage';

const MemberForm = () => {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [maidenName, setMaidenName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [partner, setPartner] = useState('');
  const [children, setChildren] = useState([]);
  const [bio, setBio] = useState('');
  const [availableChildren, setAvailableChildren] = useState([]);
  const [availablePartners, setAvailablePartners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [memberId, setMemberId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const data = await apiGet('/clenove');
        setAvailableChildren(data);
        setAvailablePartners(data);
      } catch (error) {
        console.error('Chyba při načítání členů pro děti:', error);
      }
    };

    fetchChildren();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchMemberData = async () => {
        try {
          const data = await apiGet(`/clenove/${id}`);
          if (data) {
            setName(data.familyMember.name);
            setSurname(data.familyMember.surname);
            setMaidenName(data.familyMember.maidenName || '');
            setGender(data.familyMember.gender);
            setBirthDate(data.familyMember.birthDate ? new Date(data.familyMember.birthDate).toISOString().split('T')[0] : '');
            setDeathDate(data.familyMember.deathDate ? new Date(data.familyMember.deathDate).toISOString().split('T')[0] : '');
            setPartner(data.familyMember.partner || '');
            setChildren(data.familyMember.children || []);
            setBio(data.familyMember.bio || '');
          }
        } catch (error) {
          console.error('Chyba při načítání dat člena:', error);
          setError('Nastala chyba při načítání dat člena.');
        }
      };

      fetchMemberData();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    if (!name || !surname || !gender) {
      setError('Některá povinná pole nejsou vyplněná!');
      return;
    }

    const filterEmptyFields = (data) => {
      return Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== "" && value !== undefined)
      );
    };

    const formData = {
      name,
      surname,
      maidenName: maidenName || '',
      gender,
      birthDate: birthDate || undefined,
      deathDate: deathDate || undefined,
      partner,
      children,
      bio: bio || '',
    };

    const filteredData = filterEmptyFields(formData);

    try {
      const url = `/clenove${id ? `/${id}` : ''}`;
      const response = id
        ? await apiPut(url, filteredData)
        : await apiPost(url, filteredData);

      if (response._id) {
        setSuccess(true);
        setMemberId(response._id);
      }

    } catch (error) {
      console.error('Chyba při zpracování člena:', error);
      setError('Chyba při zpracování člena.' + error);
    }
    setIsLoading(false);
  };

  const handleNewForm = () => {
    setName('');
    setSurname('');
    setMaidenName('');
    setGender('');
    setBirthDate('');
    setDeathDate('');
    setPartner('');
    setChildren([]);
    setBio('');
    setSuccess(false);
  };

  return (
    <div className='container'>
      <Button label="Zpět na seznam členů rodiny" className="btn btn-sm btn-outline-success mb-3" onClick={() => navigate('/clenove')} />

      <h2>{id ? 'Upravit člena' : 'Přidat člena'}</h2>
      <form onSubmit={handleSubmit}>
        {isLoading || success ?
          <FlashMessage
            theme={error ? 'danger' : 'success'}
            text={error ? 'Chyba! ' + error : id? 'Člen byl úspěšně aktualizován' : 'Člen byl úspěšně přidán!'}
          />
          : null}
        {success ?
          <>
            <Button label="Zobrazit člena" className='btn btn-sm btn-success' onClick={() => navigate(`/clenove/${memberId}`)} />
            <Button label="Přidat dalšího člena" className='btn btn-sm btn-outline-success ms-2' onClick={handleNewForm} />
          </>
          : null
        }
        {isLoading && !error ? <p>Načítám...</p> : null}
        <InputField
          label="Jméno*"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <InputField
          label="Příjmení*"
          name="surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          required
        />
        <InputField
          label="Rodné příjmení"
          name="maidenName"
          value={maidenName}
          onChange={(e) => setMaidenName(e.target.value)}
        />
        <RadioButton
          label="Pohlaví*"
          name="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          options={[
            { value: 'M', label: 'Muž' },
            { value: 'F', label: 'Žena' },
          ]}
        />
        <InputField
          label="Datum narození"
          name="birthDate"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          type="date"
        />
        <InputField
          label="Datum úmrtí"
          name="deathDate"
          value={deathDate}
          onChange={(e) => setDeathDate(e.target.value)}
          type="date"
        />
        <InputSelect
          label="Partner"
          name="partner"
          value={partner || ''}
          onChange={(e) => {
            console.log("Partner selected:", e.target.value);
            setPartner(e.target.value);
          }}
          options={availablePartners.length > 0
            ? availablePartners.map(partner => ({
              key: partner._id,
              value: partner._id,
              label: `${partner.name} ${partner.surname} ${partner.birthDate ? `(*${new Date(partner.birthDate).getFullYear()})` : ''}`,
            }))
            : []}
          multiple={false}
        />
        <InputSelect
          label="Děti"
          name="children"
          value={children}
          onChange={(e) => {
            console.log("Children selected:", e.target.selectedOptions); // Logování pro kontrolu
            setChildren([...e.target.selectedOptions].map(option => option.value))
          }}
          options={availableChildren.length > 0
            ? availableChildren.map(child => ({
              key: child._id,
              value: child._id,
              label: `${child.name} ${child.surname} ${child.birthDate ? `(*${new Date(child.birthDate).getFullYear()})` : ''}`,
            }))
            : []}
          multiple={true}
        />
        <TextArea
          label="Biografie"
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        {success ?
          <Button label="Uložit" />
          : <Button label="Uložit" type="submit" />}
      </form>
    </div>
  );
};

export default MemberForm;