import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, isPlatform } from '@ionic/react';
import { IonList } from '@ionic/react';
import './Tab1.css';
import RepoItem from '../components/RepoItem';
import { useEffect, useState, useRef } from 'react';
import { getUserRepos, updateRepo, deleteRepo } from '../services/github';
import { useHistory } from 'react-router-dom';
import {
  IonButton,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonAlert,
  IonToast,
  IonButtons,
  IonIcon,
} from '@ionic/react';
import { refresh as refreshIcon } from 'ionicons/icons';

const Tab1: React.FC = () => {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const history = useHistory();

  useEffect(() => {
    const onCreated = (ev: Event | any) => {
      const created = ev?.detail;
      if (created && created.id) {
        // prepend for instant visibility
        setRepos((prev) => [created, ...prev]);
      } else {
        fetchRepos();
      }
    };
    const onUpdated = (ev: Event | any) => {
      const list = ev?.detail;
      if (Array.isArray(list)) {
        setRepos(list);
      }
    };

    window.addEventListener('repoCreated', onCreated as EventListener);
    window.addEventListener('reposUpdated', onUpdated as EventListener);
    return () => {
      window.removeEventListener('repoCreated', onCreated as EventListener);
      window.removeEventListener('reposUpdated', onUpdated as EventListener);
    };
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

  function onRequestDelete(repo: any) {
    setSelectedRepo(repo);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!selectedRepo) return;
    try {
      const owner = selectedRepo.owner?.login;
      const name = selectedRepo.name;
      await deleteRepo(owner, name);
      setToastMsg('Repositorio eliminado correctamente');
      await fetchRepos();
    } catch (e: any) {
      setToastMsg(e?.response?.data?.message || e?.message || 'Error al eliminar repositorio');
    } finally {
      setConfirmOpen(false);
      setSelectedRepo(null);
    }
  }

  function onRequestEdit(repo: any) {
    setSelectedRepo(repo);
    setEditOpen(true);
  }

  async function confirmEdit(values: any) {
    if (!selectedRepo) return;
    try {
      const owner = selectedRepo.owner?.login;
      const repoName = selectedRepo.name;
      const payload: any = {};
      if (values.name && values.name.trim().length > 0) payload.name = values.name.trim();
      if (values.description !== undefined) payload.description = values.description;
      await updateRepo(owner, repoName, payload);
      setToastMsg('Repositorio actualizado correctamente');
      await fetchRepos();
    } catch (e: any) {
      setToastMsg(e?.response?.data?.message || e?.message || 'Error al actualizar repositorio');
    } finally {
      setEditOpen(false);
      setSelectedRepo(null);
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Repositorios</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => fetchRepos()}>
              <IonIcon slot="icon-only" icon={refreshIcon} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent
        fullscreen
        onTouchStart={(e: any) => {
          if (!isPlatform('android')) return;
          touchStartX.current = e.touches && e.touches[0] ? e.touches[0].clientX : null;
        }}
        onTouchEnd={(e: any) => {
          if (!isPlatform('android')) return;
          if (touchStartX.current === null) return;
          const endX = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : null;
          if (endX === null) return;
          const delta = endX - touchStartX.current;
          // swipe left -> go to crear repo
          if (delta < -50) {
            history.push('/tab2');
          }
          touchStartX.current = null;
        }}
      >
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
            <IonItem key={r.id}>
              {r.owner?.avatar_url ? (
                <IonThumbnail slot="start">
                  <img alt="Avatar" src={r.owner.avatar_url} />
                </IonThumbnail>
              ) : (
                <IonThumbnail slot="start">
                  <img alt="Avatar" src={"https://ionicframework.com/docs/img/demos/thumbnail.svg"} />
                </IonThumbnail>
              )}
              <IonLabel>{r.name}</IonLabel>
              <IonButton slot="end" color="medium" onClick={() => onRequestEdit(r)}>Editar</IonButton>
              <IonButton slot="end" color="danger" onClick={() => onRequestDelete(r)}>Eliminar</IonButton>
            </IonItem>
          ))}
        </IonList>

        <IonAlert
          isOpen={confirmOpen}
          onDidDismiss={() => setConfirmOpen(false)}
          header={'Eliminar repositorio'}
          message={`¿Estás seguro que deseas eliminar <strong>${selectedRepo?.name}</strong>? Esta acción es irreversible.`}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Eliminar', handler: () => confirmDelete() }
          ]}
        />

        <IonAlert
          isOpen={editOpen}
          onDidDismiss={() => setEditOpen(false)}
          header={'Editar repositorio'}
          inputs={[
            { name: 'name', type: 'text', value: selectedRepo?.name || '', placeholder: 'Nombre' },
            { name: 'description', type: 'textarea', value: selectedRepo?.description || '', placeholder: 'Descripción' }
          ]}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Guardar', handler: (values) => confirmEdit(values) }
          ]}
        />

        <IonToast isOpen={!!toastMsg} message={toastMsg || ''} duration={2000} onDidDismiss={() => setToastMsg(null)} />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
