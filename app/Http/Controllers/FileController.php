<?php

namespace App\Http\Controllers;

use App\Models\Letter;
use App\Models\ServiceLog;
use App\Models\SubmissionAttachment;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FileController extends Controller
{
    /**
     * Validate user authorization for file access.
     */
    protected function authorizeFileAccess(): void
    {
        /** @var User $user */
        $user = Auth::user();

        if (! $user) {
            abort(401, 'Unauthenticated.');
        }

        if (! $user->hasAnyPermission(['r-submissions', 'r-kadang-services', 'r-kadang-archives']) && ! $user->hasRole('admin')) {
            abort(403, 'Anda tidak memiliki hak akses untuk berkas ini.');
        }
    }

    /**
     * Log file access activity.
     */
    protected function logActivity(int $submissionId, string $activity, string $notes): void
    {
        $log = new ServiceLog;
        $log->submission_id = $submissionId;
        $log->stage = 'File Access';
        $log->activity = $activity;
        $log->performed_by = Auth::id();
        $log->notes = $notes;
        $log->save();
    }

    /**
     * Preview an attachment in the browser.
     */
    public function previewAttachment(SubmissionAttachment $attachment)
    {
        $this->authorizeFileAccess();

        $path = Storage::disk('public')->path($attachment->file_path);

        if (! file_exists($path)) {
            abort(404, 'File lampiran tidak ditemukan.');
        }

        $this->logActivity(
            $attachment->submission_id,
            'Melihat Berkas',
            'Pratinjau lampiran: '.$attachment->file_name
        );

        return response()->file($path, [
            'Content-Type' => $attachment->file_type ?? mime_content_type($path),
            'Content-Disposition' => 'inline; filename="'.$attachment->file_name.'"',
        ]);
    }

    /**
     * Download an attachment.
     */
    public function downloadAttachment(SubmissionAttachment $attachment): BinaryFileResponse
    {
        $this->authorizeFileAccess();

        $path = Storage::disk('public')->path($attachment->file_path);

        if (! file_exists($path)) {
            abort(404, 'File lampiran tidak ditemukan.');
        }

        $this->logActivity(
            $attachment->submission_id,
            'Unduh Berkas',
            'Mengunduh lampiran: '.$attachment->file_name
        );

        return response()->download($path, $attachment->file_name);
    }

    /**
     * Preview a generated letter.
     */
    public function previewLetter(Letter $letter)
    {
        $this->authorizeFileAccess();

        $path = Storage::disk('public')->path($letter->file_path);

        if (! file_exists($path)) {
            abort(404, 'File surat tidak ditemukan.');
        }

        $letter->load(['service']);
        $submissionId = $letter->service->submission_id;
        $filename = str_replace('/', '_', $letter->letter_number).'.pdf';

        $this->logActivity(
            $submissionId,
            'Melihat Berkas',
            'Pratinjau surat resmi: '.$letter->letter_number
        );

        return response()->file($path, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
        ]);
    }

    /**
     * Download a generated letter.
     */
    public function downloadLetter(Letter $letter): BinaryFileResponse
    {
        $this->authorizeFileAccess();

        $path = Storage::disk('public')->path($letter->file_path);

        if (! file_exists($path)) {
            abort(404, 'File surat tidak ditemukan.');
        }

        $letter->load(['service']);
        $submissionId = $letter->service->submission_id;
        $filename = str_replace('/', '_', $letter->letter_number).'.pdf';

        $this->logActivity(
            $submissionId,
            'Unduh Berkas',
            'Mengunduh surat resmi: '.$letter->letter_number
        );

        return response()->download($path, $filename);
    }

    /**
     * Print a generated letter.
     */
    public function printLetter(Letter $letter)
    {
        $this->authorizeFileAccess();

        $path = Storage::disk('public')->path($letter->file_path);

        if (! file_exists($path)) {
            abort(404, 'File surat tidak ditemukan.');
        }

        $letter->load(['service']);
        $submissionId = $letter->service->submission_id;
        $filename = str_replace('/', '_', $letter->letter_number).'.pdf';

        $this->logActivity(
            $submissionId,
            'Cetak Berkas',
            'Mencetak surat resmi: '.$letter->letter_number
        );

        return response()->file($path, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
        ]);
    }
}
