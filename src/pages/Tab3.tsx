import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonRefresher, IonRefresherContent } from '@ionic/react';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/react';
import './Tab3.css';
import { useEffect, useState } from 'react';
import { getUser } from '../services/github';
import { RefresherEventDetail } from '@ionic/react';

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string | null;
}

const Tab3: React.FC = () => {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUser();
      setUser(data);
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      setError(error.message || 'Error al obtener información del usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchUser();
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Usuario</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
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
