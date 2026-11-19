import React, {useEffect, useRef, useState} from 'react';
import {Pencil, Trash2, Plus, type LucideIcon} from 'lucide-react';
import {t, messageT} from './i18n';
import {projectName} from './catalog';

export type LibraryItem = {id?: string; name: string; detail: string};

type ProjectLibraryProps = {
  id: string;
  mobileActive: boolean;
  status?: 'loading' | 'error' | 'ready';
  title: string;
  icon: LucideIcon;
  empty: string;
  items: LibraryItem[];
  onOpen: (id: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onDeleteAll: () => void;
};

export function ProjectLibrary({
  id, mobileActive, status = 'ready', title, icon: Icon, empty, items, onOpen, onRename, onDelete, onCreate, onDeleteAll,
}: ProjectLibraryProps) {
  const label = t(title);
  return <section id={id} className="recent-projects" data-mobile-active={mobileActive} aria-labelledby={id+'-title'}>
    <header className="library-heading">
      <span className="library-icon"><Icon size={19} aria-hidden="true"/></span>
      <h2 id={id+'-title'}>{label}</h2>
      {status==='ready'&&<span className="library-count"><span className="sr-only">{t('项目数量：{0}',items.length)}</span><span aria-hidden="true">{items.length}</span></span>}
      {status==='ready' && items.length>0 && <button type="button" className="icon-button library-delete-all"
        aria-label={t('删除{0}的全部项目',label)} title={t('删除该分类全部项目')} onClick={onDeleteAll}>
        <Trash2 size={16} aria-hidden="true"/>
      </button>}
    </header>
    {status!=='ready' ? <p className="library-status" role={status==='error'?'alert':'status'}>
      {t(status==='error'?'项目列表读取失败。':'正在读取项目…')}
    </p> : items.length ? <ul className="library-items" role="list">
      {items.map(item => <li className="recent-project-row" key={item.id}>
        <button type="button" className="recent-card" title={item.name} onClick={()=>item.id&&onOpen(item.id)}>
          <span><strong>{item.name}</strong><small title={item.detail}>{item.detail}</small></span>
        </button>
        <button type="button" className="icon-button" title={t('重命名')} aria-label={t('重命名项目 {0}',item.name)} onClick={()=>item.id&&onRename(item.id)}>
          <Pencil size={16} aria-hidden="true"/>
        </button>
        <button type="button" className="icon-button" title={t('删除')} aria-label={t('删除项目 {0}',item.name)} onClick={()=>item.id&&onDelete(item.id)}>
          <Trash2 size={16} aria-hidden="true"/>
        </button>
      </li>)}
    </ul> : <div className="library-empty">
      <p className="empty-projects">{t(empty)}</p>
      <button type="button" className="library-create" aria-label={t('新建{0}',label)} onClick={onCreate}>
        <Plus size={15} aria-hidden="true"/>{t('新建项目')}
      </button>
    </div>}
  </section>;
}

export function RenameProjectDialog({name,onSave,onClose}:{
  name:string; onSave:(name:string)=>Promise<void>; onClose:()=>void;
}) {
  const ref=useRef<HTMLDialogElement>(null);
  const [draft,setDraft]=useState(name);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    const dialog=ref.current!;
    dialog.showModal();
    return ()=>dialog.close();
  },[]);

  async function save(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(busy)return;
    try {
      const value=projectName(draft);
      setError('');
      setBusy(true);
      await onSave(value);
      onClose();
    } catch(error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return <dialog className="delete-dialog" ref={ref} aria-labelledby="rename-title"
    onCancel={event=>{event.preventDefault();if(!busy)onClose();}}>
    <form onSubmit={save}>
      <h2 id="rename-title">{t('重命名项目')}</h2>
      <label>{t('项目名称')}
        <input autoFocus aria-label={t('新的项目名称')} maxLength={80} disabled={busy}
          value={draft} onChange={event=>setDraft(event.target.value)}/>
      </label>
      {error&&<p role="alert">{messageT(error)}</p>}
      <div>
        <button type="button" className="secondary" disabled={busy} onClick={onClose}>{t('取消')}</button>
        <button className="primary" disabled={busy||!draft.trim()}>{t(busy?'保存中…':'保存项目')}</button>
      </div>
    </form>
  </dialog>;
}
