<?php

namespace App\Filament\Resources;

use App\Filament\Exports\UserExport;
use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Facades\Excel;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-circle';

    protected static ?string $navigationGroup = 'Hệ thống';

    protected static ?string $modelLabel = 'Người dùng';

    protected static ?string $pluralModelLabel = 'Người dùng';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Thông tin tài khoản')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Họ và tên')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('email')
                            ->label('Email')
                            ->email()
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255),
                        Forms\Components\TextInput::make('password')
                            ->label('Mật khẩu')
                            ->password()
                            ->dehydrateStateUsing(fn($state) => filled($state) ? Hash::make($state) : null)
                            ->dehydrated(fn($state) => filled($state))
                            ->required(fn(string $operation): bool => $operation === 'create')
                            ->maxLength(255),
                        Forms\Components\DateTimePicker::make('email_verified_at')
                            ->label('Xác thực email'),
                    ]),

                Forms\Components\Section::make('Phân quyền công ty')
                    ->columns(2)
                    ->schema([
                        Forms\Components\Select::make('company_id')
                            ->label('Công ty')
                            ->relationship('company', 'name')
                            ->searchable()
                            ->preload()
                            ->nullable()
                            ->createOptionForm([
                                Forms\Components\TextInput::make('name')
                                    ->label('Tên công ty')
                                    ->required(),
                                Forms\Components\TextInput::make('email')
                                    ->label('Email')
                                    ->email(),
                            ]),
                        Forms\Components\Select::make('company_role')
                            ->label('Vai trò trong công ty')
                            ->options([
                                'owner' => 'Chủ sở hữu',
                                'admin' => 'Quản trị viên',
                                'member' => 'Thành viên',
                            ])
                            ->visible(fn(Forms\Get $get) => $get('company_id') !== null),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Họ tên')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('email')
                    ->label('Email')
                    ->searchable(),
                Tables\Columns\TextColumn::make('company.name')
                    ->label('Công ty')
                    ->searchable()
                    ->sortable()
                    ->placeholder('Chưa có'),
                Tables\Columns\BadgeColumn::make('company_role')
                    ->label('Vai trò')
                    ->formatStateUsing(fn(?string $state): string => match ($state) {
                        'owner' => 'Chủ sở hữu',
                        'admin' => 'Quản trị',
                        'member' => 'Thành viên',
                        default => '-',
                    })
                    ->colors([
                        'primary' => 'owner',
                        'success' => 'admin',
                        'gray' => 'member',
                    ]),
                Tables\Columns\IconColumn::make('email_verified_at')
                    ->label('Xác thực')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),
                Tables\Columns\TextColumn::make('roles.name')
                    ->label('Quyền hệ thống')
                    ->badge()
                    ->color('warning'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('company_id')
                    ->label('Công ty')
                    ->relationship('company', 'name')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('company_role')
                    ->label('Vai trò công ty')
                    ->options([
                        'owner' => 'Chủ sở hữu',
                        'admin' => 'Quản trị viên',
                        'member' => 'Thành viên',
                    ]),
                Tables\Filters\TernaryFilter::make('email_verified_at')
                    ->label('Đã xác thực')
                    ->nullable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
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
                    ->action(fn() => Excel::download(new UserExport, 'nguoi-dung-' . now()->format('Y-m-d') . '.xlsx')),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}

