<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\CompanyMemberResource\Pages;
use App\Models\CompanyMember;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CompanyMemberResource extends Resource
{
    protected static ?string $model = CompanyMember::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';

    protected static ?string $navigationGroup = 'Doi nhom';

    protected static ?string $navigationLabel = 'Thanh vien';

    protected static ?string $modelLabel = 'Thanh vien';

    protected static ?string $pluralModelLabel = 'Thanh vien';

    protected static ?int $navigationSort = 1;

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::where('status', 'active')->count();
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['user.name', 'employerProfile.company_name'];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thong tin thanh vien')
                    ->schema([
                        Forms\Components\Select::make('employer_profile_id')
                            ->label('Cong ty')
                            ->relationship('employerProfile', 'company_name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('user_id')
                            ->label('Nguoi dung')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('role')
                            ->label('Vai tro')
                            ->options([
                                'owner' => 'Chu so huu',
                                'manager' => 'Quan ly',
                                'member' => 'Thanh vien',
                            ])
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->label('Trang thai')
                            ->options([
                                'active' => 'Dang hoat dong',
                                'pending' => 'Cho duyet',
                                'inactive' => 'Ngung hoat dong',
                            ])
                            ->default('pending')
                            ->required(),
                        Forms\Components\Select::make('invited_by')
                            ->label('Nguoi moi')
                            ->relationship('invitedByUser', 'name')
                            ->searchable()
                            ->preload()
                            ->nullable(),
                        Forms\Components\DateTimePicker::make('invited_at')
                            ->label('Ngay moi'),
                        Forms\Components\DateTimePicker::make('joined_at')
                            ->label('Ngay tham gia'),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Thanh vien')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('employerProfile.company_name')
                    ->label('Cong ty')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('role')
                    ->label('Vai tro')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'owner' => 'danger',
                        'manager' => 'warning',
                        'member' => 'info',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'owner' => 'Chu so huu',
                        'manager' => 'Quan ly',
                        'member' => 'Thanh vien',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('status')
                    ->label('Trang thai')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'active' => 'success',
                        'pending' => 'warning',
                        'inactive' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn(string $state): string => match ($state) {
                        'active' => 'Hoat dong',
                        'pending' => 'Cho duyet',
                        'inactive' => 'Ngung',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('invitedByUser.name')
                    ->label('Nguoi moi')
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('joined_at')
                    ->label('Ngay tham gia')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngay tao')
                    ->dateTime('d/m/Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->label('Trang thai')
                    ->options([
                        'active' => 'Hoat dong',
                        'pending' => 'Cho duyet',
                        'inactive' => 'Ngung',
                    ]),
                Tables\Filters\SelectFilter::make('role')
                    ->label('Vai tro')
                    ->options([
                        'owner' => 'Chu so huu',
                        'manager' => 'Quan ly',
                        'member' => 'Thanh vien',
                    ]),
            ])
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
            'index' => Pages\ListCompanyMembers::route('/'),
            'create' => Pages\CreateCompanyMember::route('/create'),
            'edit' => Pages\EditCompanyMember::route('/{record}/edit'),
        ];
    }
}
