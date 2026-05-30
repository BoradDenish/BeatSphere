import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Music,
  Video,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatFileSize } from '@/lib/utils';
import { useMusicStore } from '@/stores/musicStore';
import { uploadAPI } from '@/lib/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Youtube, Link as LinkIcon, Download } from 'lucide-react';

interface UploadFormProps {
  onSuccess?: () => void;
}

export function UploadForm({ onSuccess }: UploadFormProps) {
  const [method, setMethod] = useState<'file' | 'youtube'>('file');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('audio');
  const [isPremium, setIsPremium] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const { createMedia, importMedia, isLoading, categories, fetchCategories } = useMusicStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleFetchYoutubeInfo = async () => {
    if (!youtubeUrl.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await uploadAPI.youtubeInfo({ url: youtubeUrl });
      setTitle(res.data.title);
      setDescription(res.data.description);
      setThumbnailPreview(res.data.thumbnailUrl);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch YouTube info');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const droppedFile = acceptedFiles[0];
      if (droppedFile.type.startsWith('audio')) {
        setMediaType('audio');
      } else if (droppedFile.type.startsWith('video')) {
        setMediaType('video');
      }
      setFile(droppedFile);
      setUploadStatus('idle');
      setError(null);
    }
  }, []);

  const onThumbnailDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const thumb = acceptedFiles[0];
      setThumbnail(thumb);
      setThumbnailPreview(URL.createObjectURL(thumb));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: mediaType === 'audio' ? {
      'audio/*': ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'],
    } : {
      'video/*': ['.mp4', '.webm', '.ogg', '.avi', '.mkv', '.mov'],
    },
    maxFiles: 1,
    maxSize: mediaType === 'audio' ? 50 * 1024 * 1024 : 500 * 1024 * 1024,
  });

  const { getRootProps: getThumbProps, getInputProps: getThumbInputProps } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (method === 'file' && !file) {
      setError('Please select a file');
      return;
    }
    if (method === 'youtube' && !youtubeUrl.trim()) {
      setError('Please provide a YouTube URL');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(0);
    setError(null);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 5, 90));
    }, 300);

    try {
      if (method === 'file') {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('mediaType', mediaType);
        formData.append('isPremium', isPremium.toString());
        formData.append('category', category);
        formData.append('file', file!);
        if (thumbnail) {
          formData.append('thumbnail', thumbnail);
        }
        await createMedia(formData);
      } else {
        // 1. Backend downloads the content
        const downloadRes = await uploadAPI.youtubeDownload({ 
          url: youtubeUrl, 
          mediaType: mediaType 
        });
        
        // 2. Import into database
        await importMedia({
          title,
          description,
          category,
          mediaType,
          isPremium,
          fileUrl: downloadRes.data.file.url,
          thumbnailUrl: downloadRes.data.thumbnail?.url,
          duration: downloadRes.data.duration,
          fileSize: downloadRes.data.file.size,
          mimeType: downloadRes.data.file.mimeType
        });
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      setTimeout(() => {
        onSuccess?.();
        resetForm();
      }, 1500);
    } catch (err: any) {
      clearInterval(progressInterval);
      setUploadStatus('error');
      setError(err.response?.data?.error || 'Import failed');
    }
  };

  const resetForm = () => {
    setYoutubeUrl('');
    setTitle('');
    setDescription('');
    setCategory('');
    setFile(null);
    setThumbnail(null);
    setThumbnailPreview(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setError(null);
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus('idle');
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(null);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={method} onValueChange={(v: any) => setMethod(v)} className="w-full">
        <TabsList className="grid grid-cols-2 h-14 bg-muted/30 p-1.5 rounded-2xl border border-white/5 shadow-inner mb-8">
          <TabsTrigger value="file" className="rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all gap-2">
            <Upload className="h-4 w-4" />
            LOCAL FILE
          </TabsTrigger>
          <TabsTrigger value="youtube" className="rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all gap-2 text-red-500 data-[state=active]:text-red-500">
            <Youtube className="h-4 w-4" />
            YOUTUBE LINK
          </TabsTrigger>
        </TabsList>

        <TabsContent value="youtube" className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity duration-500" />
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-red-500 transition-colors" />
                <Input
                  placeholder="Paste YouTube video URL here..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="h-14 pl-12 bg-background/50 backdrop-blur-xl border-white/10 rounded-xl font-medium"
                />
              </div>
              <Button 
                type="button"
                onClick={handleFetchYoutubeInfo}
                disabled={isProcessing || !youtubeUrl.trim()}
                className="h-14 px-6 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "PROCESS"}
              </Button>
            </div>
          </div>

          {thumbnailPreview && method === 'youtube' && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl group animate-in zoom-in-95 duration-500">
              <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-bold line-clamp-1">{title}</p>
              </div>
              <button 
                onClick={() => setThumbnailPreview(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="file" className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group',
              isDragActive
                ? 'border-purple-500 bg-purple-500/5'
                : 'border-white/10 bg-muted/20 hover:border-purple-500/50 hover:bg-purple-500/5',
              file && 'border-green-500 bg-green-500/5'
            )}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-6">
                <div className="h-20 w-20 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  {mediaType === 'audio' ? (
                    <Music className="h-10 w-10 text-green-500" />
                  ) : (
                    <Video className="h-10 w-10 text-green-500" />
                  )}
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-lg">{file.name}</p>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
                    {formatFileSize(file.size)} • {file.type.split('/')[1]}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-red-500/10 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-20 w-20 rounded-3xl bg-muted/30 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <Upload className={cn(
                    'h-10 w-10',
                    isDragActive ? 'text-purple-500 animate-bounce' : 'text-muted-foreground'
                  )} />
                </div>
                <div>
                  <p className="text-xl font-bold tracking-tight">
                    {isDragActive ? 'RELEASE TO DROP' : 'CHOOSE MEDIA FILE'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 font-medium">
                    {mediaType === 'audio' ? 'Lossless Audio (max 50MB)' : 'High-Def Video (max 500MB)'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div
            {...getThumbProps()}
            className={cn(
              'border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group',
              thumbnailPreview && method === 'file'
                ? 'border-green-500 bg-green-500/5'
                : 'border-white/10 bg-muted/20 hover:border-purple-500/30'
            )}
          >
            <input {...getThumbInputProps()} />
            {thumbnailPreview && method === 'file' ? (
              <div className="flex items-center justify-center gap-6">
                <img src={thumbnailPreview} alt="Thumb" className="h-16 w-16 object-cover rounded-xl shadow-lg" />
                <div className="text-left flex-1">
                  <p className="font-bold text-sm">Cover Artwork Added</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Custom Thumbnail</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeThumbnail();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <Download className="h-6 w-6 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                <p className="text-sm font-bold text-muted-foreground">ADD COVER IMAGE (OPTIONAL)</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Metadata Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your sound a name"
              className="h-14 bg-muted/30 border-white/5 rounded-xl font-bold text-lg"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Content Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-14 bg-muted/30 border-white/5 rounded-xl font-bold">
                <SelectValue placeholder="Genre / Style" />
              </SelectTrigger>
              <SelectContent className="glass-morphism rounded-2xl border-white/10">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="rounded-xl font-medium focus:bg-purple-500 focus:text-white">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Format Settings</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMediaType('audio')}
                className={`flex items-center justify-center gap-3 h-14 rounded-xl border-2 transition-all font-bold ${
                  mediaType === 'audio'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                    : 'border-white/5 bg-muted/20 text-muted-foreground'
                }`}
              >
                <Music className="h-5 w-5" />
                Audio
              </button>
              <button
                type="button"
                onClick={() => setMediaType('video')}
                className={`flex items-center justify-center gap-3 h-14 rounded-xl border-2 transition-all font-bold ${
                  mediaType === 'video'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                    : 'border-white/5 bg-muted/20 text-muted-foreground'
                }`}
              >
                <Video className="h-5 w-5" />
                Video
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Access Control</Label>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="flex items-center gap-3">
                <Crown className={cn("h-5 w-5", isPremium ? "text-amber-500" : "text-muted-foreground")} />
                <span className="font-bold text-sm tracking-tight">PREMIUM ONLY</span>
              </div>
              <Switch checked={isPremium} onCheckedChange={setIsPremium} className="data-[state=checked]:bg-amber-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Detailed Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Share the story behind this creation..."
          className="h-14 bg-muted/30 border-white/5 rounded-xl font-medium"
        />
      </div>

      {uploadStatus === 'uploading' && (
        <div className="space-y-4 p-6 rounded-2xl bg-muted/20 border border-white/5 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between font-black text-xs uppercase tracking-widest">
            <span className="text-purple-500 animate-pulse">{method === 'youtube' ? 'IMPORTING FROM CLOUD' : 'UPLOADING TO SERVER'}</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2 bg-muted rounded-full" />
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3 animate-shake">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-3 animate-in zoom-in-95">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold uppercase tracking-widest">Content Published Successfully!</p>
        </div>
      )}

      <Button
        className={cn(
          "w-full h-16 rounded-2xl font-black text-lg tracking-widest shadow-2xl transition-all active:scale-95 group",
          method === 'youtube' ? "bg-red-500 hover:bg-red-600 text-white" : "btn-gradient text-white"
        )}
        onClick={handleUpload}
        disabled={uploadStatus === 'uploading' || isProcessing || isLoading}
      >
        {uploadStatus === 'uploading' ? (
          <>
            <Loader2 className="h-6 w-6 mr-3 animate-spin" />
            PROCESSING...
          </>
        ) : (
          <>
            {method === 'youtube' ? <Download className="h-6 w-6 mr-3 group-hover:translate-y-1 transition-transform" /> : <Upload className="h-6 w-6 mr-3 group-hover:-translate-y-1 transition-transform" />}
            {method === 'youtube' ? 'IMPORT CONTENT' : 'PUBLISH NOW'}
          </>
        )}
      </Button>
    </div>
  );
}
