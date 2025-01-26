import React, { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../utils/api';
import InputField from './form-parts/InputField';
import TextArea from './form-parts/TextArea';
import InputSelect from './form-parts/InputSelect';
import RadioButton from './form-parts/RadioButton';
import Button from './form-parts/Button';

const MemberForm = ({ memberData = {} }) => {
  const [name, setName] = useState(memberData.name || '');
  const [surname, setSurname] = useState(memberData.surname || '');
  const [maidenName, setMaidenName] = useState(memberData.maidenName || '');
  const [gender, setGender] = useState(memberData.gender || '');
  const [birthDate, setBirthDate] = useState(memberData.birthDate || '');
  const [deathDate, setDeathDate] = useState(memberData.deathDate || '');
  const [children, setChildren] = useState(memberData.children || []);
  const [bio, setBio] = useState(memberData.bio || '');
  const [availableChildren, setAvailableChildren] = useState([]);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const data = await apiGet('/clenove');
        setAvailableChildren(data);
      } catch (error) {
        console.error('Chyba při načítání členů pro děti:', error);
      }
    };

    fetchChildren();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !surname || !gender ) {
        console.error('Některá povinná pole nejsou vyplněná!');
        return;
    }

    const formData = {
      name,
      surname,
      maidenName,
      gender,
      birthDate,
      deathDate,
      children,
      bio,
    };

    console.log('Odesílaná data:', formData);

    try {
        const response = await apiPost('/clenove', formData);
        console.log('Člen byl úspěšně přidán:', response);
      } 
    catch (error) {
        console.error('Chyba při přidávání člena:', error);
      }
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputField
        label="Jméno"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <InputField
        label="Příjmení"
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
        label="Pohlaví"
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
        label="Děti"
        name="children"
        value={children}
        onChange={(e) => setChildren([...e.target.selectedOptions].map(option => option.value))}
        options={availableChildren.map(child => ({
          value: child._id,
          label: `${child.name} ${child.surname}`,
        }))}
        multiple
      />
      <TextArea
        label="Biografie"
        name="bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
      <Button label="Uložit" type="submit" />
    </form>
  );
};

export default MemberForm;