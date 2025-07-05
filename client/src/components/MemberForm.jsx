import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGet, apiPost, apiPut } from '../utils/api';
import InputField from './form-parts/InputField';
import TextArea from './form-parts/TextArea';
import RadioButton from './form-parts/RadioButton';
import Button from './form-parts/Button';
import FlashMessage from './form-parts/FlashMessage';
//import { set } from 'mongoose';
//import { set } from 'mongoose';

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
  const [profilePhoto, setProfilePhoto] = useState('');
  const [previewURL, setPreviewURL] = useState(null);
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
            setProfilePhoto(data.familyMember.profilePhoto || '');
            setPreviewURL(data.familyMember.profilePhoto ? `${process.env.REACT_APP_API_URL}${data.familyMember.profilePhoto}` : null);
          }
        } catch (error) {
          console.error('Chyba při načítání dat člena:', error);
          setError('Nastala chyba při načítání dat člena.');
        }
      };
      fetchMemberData();
    }
  }, [id]);

  const partnerOptions = [
    { key: '', value: '', label: '--' },
    ...(
      availablePartners.length > 0
        ? availablePartners
          .filter(partner =>
            typeof partner === "object" &&
            partner !== null &&
            (Math.abs(new Date(partner.birthDate).getFullYear() - new Date(birthDate).getFullYear()) < 60 || partner.birthDate === undefined) &&
            partner.gender !== gender)
          .map(partner => ({
            key: partner._id,
            value: partner._id,
            label: `${partner.name} ${partner.surname} ${partner.birthDate ? `(*${new Date(partner.birthDate).getFullYear()})` : ''}`,
          }))
        : [])
  ];

  const childrenOptions = [
    { key: '', value: '', label: '--' },
    ...(
      availableChildren.length > 0
        ? availableChildren
          .filter(child => typeof child === "object"
            && child !== null
            && ((new Date(child.birthDate).getFullYear() - new Date(birthDate).getFullYear()) < 80 || child.birthDate === undefined) // Filter children with age difference less than 80 years
          ) // filter out non-objects from the array
          .map(child => ({
            key: child._id,
            value: child._id,
            label: `${child.name} ${child.surname} ${child.birthDate ? `(*${new Date(child.birthDate).getFullYear()})` : ''}`,
          }))
        : [])
  ];

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
        const newMemberId = response._id;
        if (profilePhoto) {
          const formData = new FormData();
          formData.append('name', name);
          formData.append('surname', surname);
          formData.append('profilePhoto', profilePhoto);

          const uploadResponse = await apiPost('/upload', formData);
          console.log('File uploaded:', uploadResponse);

          const updateResponse = await apiPut(`/clenove/${newMemberId}`, {
            profilePhoto: uploadResponse.filePath,
          });
          console.log('Member updated with photo:', updateResponse);
        }
      }

    } catch (error) {
      console.error('Chyba při zpracování člena:', error);
      setError('Chyba při zpracování člena.' + error);
    }
    setIsLoading(false);
  };

  const handlePreview = (file) => {
    const url = URL.createObjectURL(file);
    setPreviewURL(url);
  }

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
    setProfilePhoto(null);
  };

  return (
    <div className='container'>
      <Button label="Zpět na seznam členů rodiny" className="btn btn-sm btn-outline-success mb-3" onClick={() => navigate('/clenove')} />

      <h2>{id ? 'Upravit člena' : 'Přidat člena'}</h2>
      <form onSubmit={handleSubmit}>
        {isLoading || success ?
          <FlashMessage
            theme={error ? 'danger' : 'success'}
            text={error ? 'Chyba! ' + error : id ? 'Člen byl úspěšně aktualizován' : 'Člen byl úspěšně přidán!'}
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
        <div className='row'>
        <InputField
          label="Jméno*"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={'col-md-4'}
        />
        <InputField
          label="Příjmení*"
          name="surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          required
          className={'col-md-4'}
        />
        <InputField
          label="Rodné příjmení"
          name="maidenName"
          value={maidenName}
          onChange={(e) => setMaidenName(e.target.value)}
          className={'col-md-4'}
        />
        </div>
        
        
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
        <div className='row'>
        <InputField
          label="Datum narození"
          name="birthDate"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          type="date"
          className={'col-md-6'}
        />
        <InputField
          label="Datum úmrtí"
          name="deathDate"
          value={deathDate}
          onChange={(e) => setDeathDate(e.target.value)}
          type="date"
          className={'col-md-6'}
        />
        </div>
        <div className='row'>
          <div className='col-md-6'>
        <label htmlFor="partner-select">Partner</label>
        <Select
          id='partner-select'
          label="Partner"
          name="partner"
          value={partnerOptions.find(option => option.value === partner) || ''}
          onChange={(selectedOption) => {
            console.log("Partner selected:", selectedOption.value);
            setPartner(selectedOption ? selectedOption.value : '');
          }}
          options={partnerOptions}
          isClearable // Možnost vymazání výběru
          placeholder="Vyberte partnera..."
        />
        </div>
        <div className='col-md-6'>
        <label htmlFor="children-select">Děti</label>
        <Select
          id='children-select'
          label="Děti"
          name="children"
          value={childrenOptions.filter(option => children.includes(option.value))}
          onChange={(selectedOptions) => {
            console.log("Children selected:", selectedOptions);
            setChildren(selectedOptions ? selectedOptions.map(option => option.value) : []);
          }}
          options={childrenOptions}
          isClearable
          placeholder="Vyberte děti..."
          isMulti
        />
        </div>
        </div>
        <TextArea
          label="Biografie"
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <label htmlFor="profile-photo">Profilový obrázek</label>
        <br />
        {profilePhoto ? <img src={previewURL} style={{ maxWidth: '80px', margin: '1rem 1rem 1rem 0' }} /> : null}
        <input
          id='profile-photo'
          type="file"
          accept="image/*"
          onChange={(e) => {
            setProfilePhoto(e.target.files[0]);
            if (e.target.files && e.target.files[0]) {
              handlePreview(e.target.files[0]);
            }
          }}
        />
        <br />
        {success ?
          <Button label="Uložit" />
          : <Button label="Uložit" type="submit" />}
      </form>
    </div>
  );
};

export default MemberForm;