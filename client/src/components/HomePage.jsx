const HomePage = () => {
    return (
        <div className="container">
            <h1>Raichlovi</h1>
            <p>Vítejte na stránce věnované rodině Raichlů. Stránky jsou zatím ve fázi, kdy obsahují formulář pro přidávání členů a výpis uložených členů. Existují rodinné vazby mezi členy a to rodič-děti a osoba-partner.</p>
            <p>Do budoucna přidám funkce na zúžení výběru dětí a partnerů podle věku, protože je nesmysl vybírat z celého seznamu lidi vzdálené od sebe třeba sto let.</p>
            <p>Stránky jsou vytvořeny pomocí Reactu a Expressu a komunikují s MongoDB databází.</p>
        </div>
    );
};

export default HomePage;