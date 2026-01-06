import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, isPlatform, useIonViewWillEnter } from '@ionic/react';
import { IonList } from '@ionic/react';
import './Tab1.css';
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
  interface Repo {
    id: number;
    name: string;
    description: string | null;
    owner: {
      login: string;
      avatar_url: string;
    };
  }
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const history = useHistory();
  const needsRefresh = useRef(false);

  // Refrescar automáticamente cuando se regresa a esta pestaña
  useIonViewWillEnter(() => {
    if (needsRefresh.current) {
      fetchRepos();
      needsRefresh.current = false;
    }
  });

  useEffect(() => {
    const onCreated = () => {
      // Marcar que necesitamos refrescar la próxima vez que entremos a la vista
      needsRefresh.current = true;
      // También hacer fetch inmediato para actualización instantánea
      fetchRepos();
    };
    const onUpdated = () => {
      // Forzar recarga desde el servidor
      fetchRepos();
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
      // Agregar un pequeño delay para asegurar que GitHub haya sincronizado los cambios
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = await getUserRepos();
      setRepos(data);
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      setError(error.message || 'Error al obtener repositorios');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRepos();
  }, []);

  function onRequestDelete(repo: Repo) {
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
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      setToastMsg(error.message || 'Error al eliminar repositorio');
    } finally {
      setConfirmOpen(false);
      setSelectedRepo(null);
    }
  }

  function onRequestEdit(repo: Repo) {
    setSelectedRepo(repo);
    setEditOpen(true);
  }

  async function confirmEdit(values: { name: string; description: string }) {
    if (!selectedRepo) return;
    
    // Guardar los datos antes de limpiar el estado
    const owner = selectedRepo.owner?.login;
    const repoName = selectedRepo.name;
    const oldRepo = selectedRepo;
    
    // Verificar si realmente hay cambios
    const nameChanged = values.name && values.name.trim() !== oldRepo.name;
    const descriptionChanged = values.description !== (oldRepo.description || '');
    
    if (!nameChanged && !descriptionChanged) {
      setEditOpen(false);
      setSelectedRepo(null);
      setToastMsg('No existen cambios a guardar');
      return;
    }
    
    // Cerrar el diálogo inmediatamente
    setEditOpen(false);
    setSelectedRepo(null);
    
    try {
      const payload: { name?: string; description?: string } = {};
      if (values.name && values.name.trim().length > 0) payload.name = values.name.trim();
      if (values.description !== undefined) payload.description = values.description;
      
      await updateRepo(owner, repoName, payload);
      console.log('Repo actualizado:', payload);
      
      // Actualizar el estado local inmediatamente con los nuevos valores
      setRepos(prevRepos => 
        prevRepos.map(repo => {
          if (repo.id === oldRepo.id) {
            return {
              ...repo,
              name: values.name && values.name.trim().length > 0 ? values.name.trim() : repo.name,
              description: values.description !== undefined ? values.description : repo.description
            };
          }
          return repo;
        })
      );
      
      setToastMsg('Repositorio actualizado correctamente');
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      setToastMsg(error.message || 'Error al actualizar repositorio');
      // Refrescar en caso de error para asegurar que tenemos los datos más recientes
      await fetchRepos();
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
        onTouchStart={(e) => {
          if (!isPlatform('android')) return;
          const touchEvent = e as React.TouchEvent<HTMLIonContentElement>;
          touchStartX.current = touchEvent.touches && touchEvent.touches[0] ? touchEvent.touches[0].clientX : null;
        }}
        onTouchEnd={(e) => {
          if (!isPlatform('android')) return;
          const touchEvent = e as React.TouchEvent<HTMLIonContentElement>;
          if (touchStartX.current === null) return;
          const endX = touchEvent.changedTouches && touchEvent.changedTouches[0] ? touchEvent.changedTouches[0].clientX : null;
          if (endX === null) return;
          const delta = endX - touchStartX.current;
          // deslizar a la izquierda -> ir a crear repo
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
          message={`¿Estás seguro que deseas eliminar "${selectedRepo?.name}"? Esta acción es irreversible.`}
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
