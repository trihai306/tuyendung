<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\CandidateProfileResource\Pages;
use App\Models\CandidateProfile;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CandidateProfileResource extends Resource
{
    protected static ?string $model = CandidateProfile::class;

    protected static ?string $navigationIcon = 'heroicon-o-user';

    protected static ?string $navigationGroup = 'Người dùng';

    protected static ?string $navigationLabel = 'Hồ sơ ứng viên';

    protected static ?string $modelLabel = 'Hồ sơ ứng viên';

    protected static ?string $pluralModelLabel = 'Hồ sơ ứng viên';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thong tin')
                    ->schema([
                        Forms\Components\Select::make('user_id')
                            ->label('Người dùng')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Textarea::make('bio')
                            ->label('Gioi thieu')
                            ->columnSpanFull(),
                        Forms\Components\TagsInput::make('skills')
                            ->label('Ky nang')
                            ->columnSpanFull(),
                        Forms\Components\TextInput::make('experience_years')
                            ->label('Kinh nghiem (nam)')
                            ->numeric(),
                        Forms\Components\TextInput::make('education')
                            ->label('Hoc van')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('resume_url')
                            ->label('CV URL')
                            ->url()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('desired_salary')
                            ->label('Luong mong muon')
                            ->numeric()
                            ->prefix('VND'),
                        Forms\Components\Select::make('job_type_preference')
                            ->label('Loai viec mong muon')
                            ->options([
                                'full_time' => 'Toan thoi gian',
                                'part_time' => 'Ban thoi gian',
                                'seasonal' => 'Thoi vu',
                                'remote' => 'Tu xa',
                            ]),
                        Forms\Components\Select::make('gender')
                            ->label('Giới tính')
                            ->options([
                                'male' => 'Năm',
                                'female' => 'Nu',
                                'other' => 'Khac',
                            ]),
                        Forms\Components\DatePicker::make('date_of_birth')
                            ->label('Ngày sinh'),
                        Forms\Components\TextInput::make('current_address')
                            ->label('Địa chỉ'),
                        Forms\Components\TextInput::make('district')
                            ->label('Quận/Huyện'),
                        Forms\Components\TextInput::make('city')
                            ->label('Thành phố'),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Ho ten')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('experience_years')
                    ->label('Kinh nghiệm')
                    ->suffix(' nam')
                    ->sortable(),
                Tables\Columns\TextColumn::make('education')
                    ->label('Hoc van')
                    ->limit(30),
                Tables\Columns\TextColumn::make('city')
                    ->label('Thành phố')
                    ->searchable(),
                Tables\Columns\TextColumn::make('desired_salary')
                    ->label('Luong mong muon')
                    ->numeric()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCandidateProfiles::route('/'),
            'create' => Pages\CreateCandidateProfile::route('/create'),
            'edit' => Pages\EditCandidateProfile::route('/{record}/edit'),
        ];
    }
}
