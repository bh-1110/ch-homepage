import { HomeClient } from './HomeClient';
import { getHomepageContent } from '../lib/homepage';

export default function Home() {
  return <HomeClient content={getHomepageContent()} />;
}
