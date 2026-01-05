import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/react';
import './Tab3.css';
import { useEffect, useState } from 'react';
import { getUser } from '../services/github';

const Tab3: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUser();
        setUser(data);
      } catch (e: any) {
        setError(e?.message || 'Error al obtener información del usuario');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Usuario</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Usuario</IonTitle>
          </IonToolbar>
        </IonHeader>
        {loading && <div className="loading">Cargando usuario...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && user && (
          <div className="card-container">
            <IonCard className="card">
              <img alt="Avatar" src={user.avatar_url} />
              <IonCardHeader>
                <IonCardTitle>{user.name}</IonCardTitle>
                <IonCardSubtitle>{user.login}</IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent>{user.bio}</IonCardContent>
            </IonCard>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
