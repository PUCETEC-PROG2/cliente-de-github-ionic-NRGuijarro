import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { IonList } from '@ionic/react';
import './Tab1.css';
import RepoItem from '../components/RepoItem';
import { useEffect, useState } from 'react';
import { getUserRepos } from '../services/github';

const Tab1: React.FC = () => {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onCreated = () => {
      fetchRepos();
    };
    window.addEventListener('repoCreated', onCreated as EventListener);
    return () => window.removeEventListener('repoCreated', onCreated as EventListener);
  }, []);

  async function fetchRepos() {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserRepos();
      setRepos(data);
    } catch (e: any) {
      setError(e?.message || 'Error al obtener repositorios');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRepos();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Repositorios</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Repositorios</IonTitle>
          </IonToolbar>
        </IonHeader>
        {loading && <div className="loading">Cargando repositorios...</div>}
        {error && <div className="error">{error}</div>}
        <IonList>
          {!loading && !error && repos.length === 0 && (
            <div className="empty">No hay repositorios.</div>
          )}
          {repos.map((r) => (
            <RepoItem key={r.id} name={r.name} imageUrl={r.owner?.avatar_url} />
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
