import { getHomepageContent } from '../../lib/homepage';
import { AdminContentEditor } from './AdminContentEditor';

export const metadata = {
  title: 'CMS | Psychotherapie Wien'
};

export default function AdminPage() {
  return <AdminContentEditor initialContent={getHomepageContent()} />;
}
