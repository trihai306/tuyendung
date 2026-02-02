<?php

namespace App\Filament\Resources;

use App\Filament\Exports\CandidateExport;
use App\Filament\Resources\CandidateResource\Pages;
use App\Filament\Resources\CandidateResource\RelationManagers;
use App\Models\Candidate;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Maatwebsite\Excel\Facades\Excel;

class CandidateResource extends Resource
{
    protected static ?string $model = Candidate::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationGroup = 'Ứng viên';

    protected static ?string $modelLabel = 'Ứng viên';

    protected static ?string $pluralModelLabel = 'Ứng viên';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thông tin cá nhân')
                    ->columns(2)
                    ->schema([
                        Forms\Components\FileUpload::make('avatar_url')
                            ->label('Ảnh đại diện')
                            ->image()
                            ->avatar()
                            ->directory('candidates'),
                        Forms\Components\TextInput::make('full_name')
                            ->label('Họ và tên')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('email')
                            ->label('Email')
                            ->email()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('phone')
                            ->label('Số điện thoại')
                            ->tel()
                            ->maxLength(20),
                    ]),

                Forms\Components\Section::make('Nguồn & Phân loại')
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('source')
                            ->label('Nguồn ứng viên')
                            ->options([
                                'facebook' => 'Facebook',
                                'zalo' => 'Zalo',
                                'website' => 'Website',
                                'referral' => 'Giới thiệu',
                                'other' => 'Khác',
                            ]),
                        Forms\Components\Select::make('status')
                            ->label('Trạng thái')
                            ->options([
                                'active' => 'Đang hoạt động',
                                'inactive' => 'Không hoạt động',
                                'blacklisted' => 'Danh sách đen',
                            ])
                            ->default('active'),
                        Forms\Components\TagsInput::make('tags')
                            ->label('Nhãn')
                            ->separator(','),
                        Forms\Components\Select::make('rating')
                            ->label('Đánh giá')
                            ->options([
                                1 => '⭐ 1 sao',
                                2 => '⭐⭐ 2 sao',
                                3 => '⭐⭐⭐ 3 sao',
                                4 => '⭐⭐⭐⭐ 4 sao',
                                5 => '⭐⭐⭐⭐⭐ 5 sao',
                            ]),
                    ]),

                Forms\Components\Section::make('Hồ sơ')
                    ->schema([
                        Forms\Components\FileUpload::make('resume_url')
                            ->label('CV/Resume')
                            ->acceptedFileTypes(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
                            ->directory('resumes'),
                        Forms\Components\Textarea::make('notes')
                            ->label('Ghi chú')
                            ->rows(3)
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('avatar_url')
                    ->label('')
                    ->circular(),
                Tables\Columns\TextColumn::make('full_name')
                    ->label('Họ tên')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('email')
                    ->label('Email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('phone')
                    ->label('SĐT')
                    ->searchable(),
                Tables\Columns\BadgeColumn::make('source')
                    ->label('Nguồn')
                    ->colors([
                        'primary' => 'facebook',
                        'success' => 'zalo',
                        'warning' => 'website',
                        'info' => 'referral',
                    ]),
                Tables\Columns\TextColumn::make('applications_count')
                    ->label('Đơn ứng tuyển')
                    ->counts('applications'),
                Tables\Columns\BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->colors([
                        'success' => 'active',
                        'secondary' => 'inactive',
                        'danger' => 'blacklisted',
                    ]),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('source')
                    ->label('Nguồn')
                    ->options([
                        'facebook' => 'Facebook',
                        'zalo' => 'Zalo',
                        'website' => 'Website',
                        'referral' => 'Giới thiệu',
                    ]),
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'active' => 'Đang hoạt động',
                        'inactive' => 'Không hoạt động',
                        'blacklisted' => 'Danh sách đen',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->headerActions([
                Tables\Actions\Action::make('export')
                    ->label('Xuất Excel')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->action(fn() => Excel::download(new CandidateExport, 'ung-vien-' . now()->format('Y-m-d') . '.xlsx')),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            // RelationManagers will be added after creation
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCandidates::route('/'),
            'create' => Pages\CreateCandidate::route('/create'),
            'view' => Pages\ViewCandidate::route('/{record}'),
            'edit' => Pages\EditCandidate::route('/{record}/edit'),
        ];
    }
}
